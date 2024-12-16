import ast
import inspect
import json
import logging
from typing import Any, Dict, List, Optional

from django.contrib.auth import get_user_model

from api.models.agent.tools import Tool
from api.models.auth.user import CustomUser
from api.repositories.tool_repository import ToolRepository
from api.utils.exceptions import ServiceError, ValidationError

User = get_user_model()
logger = logging.getLogger(__name__)


class ToolService:
    def __init__(self):
        self.repository = ToolRepository()
        self.logger = logger

    def create_tool(self, data: dict) -> Tool:
        """Create a new tool"""
        try:
            # Parse and validate the function content
            parsed_data = self._parse_function_content(data["function_content"])
            data.update(parsed_data)

            # Create the tool
            return self.repository.create(data)
        except Exception as e:
            self.logger.error(f"Error creating tool: {str(e)}")
            raise ServiceError(f"Failed to create tool: {str(e)}")

    def get_tool(self, tool_id: int) -> Tool:
        """Get a tool by ID"""
        tool = self.repository.get_by_id(tool_id)
        if not tool:
            raise ValidationError("Tool not found")
        return tool

    def get_user_tools(self, user_id: int) -> List[Tool]:
        """Get all tools created by a specific user"""
        return self.repository.get_by_user(user_id)

    def list_tools(self) -> List[Tool]:
        """Get all tools"""
        return self.repository.list()

    def get_enabled_tools(self) -> List[Tool]:
        """Get all enabled tools"""
        return self.repository.get_enabled_tools()

    def update_tool(self, tool_id: int, user: "CustomUser", data: dict) -> Tool:
        """Update a tool"""
        tool = self.get_tool(tool_id)

        # Check if user has permission to update
        if not user.is_staff and not user.is_superuser and tool.created_by_id != user.id:
            raise ValidationError("You don't have permission to update this tool")

        # If function content is being updated, parse and validate it
        if "function_content" in data:
            parsed_data = self._parse_function_content(data["function_content"])
            data.update(parsed_data)

        return self.repository.update(tool_id, data)

    def delete_tool(self, tool_id: int, user: "CustomUser") -> bool:
        """Delete a tool"""
        tool = self.get_tool(tool_id)

        # Check if user has permission to delete
        if not user.is_staff and not user.is_superuser and tool.created_by_id != user.id:
            raise ValidationError("You don't have permission to delete this tool")

        return self.repository.delete(tool_id)

    def _parse_function_content(self, content: str) -> Dict:
        """Parse function content to extract metadata"""
        try:
            # Parse the Python code
            tree = ast.parse(content)

            # Get the function definition
            if not tree.body or not isinstance(tree.body[0], ast.FunctionDef):
                raise ValidationError("Content must contain a single function definition")

            func_def = tree.body[0]

            # Extract docstring
            docstring = ast.get_docstring(func_def)
            if not docstring:
                raise ValidationError("Function must have a Google-style docstring")

            # Parse parameters
            parameters = {"type": "object", "required": [], "properties": {}}

            for arg in func_def.args.args:
                arg_name = arg.arg
                parameters["required"].append(arg_name)

                # Try to get type annotation if it exists
                if arg.annotation and isinstance(arg.annotation, ast.Name):
                    arg_type = arg.annotation.id.lower()
                    # Map Python types to JSON schema types
                    type_mapping = {
                        "str": "string",
                        "int": "integer",
                        "float": "number",
                        "bool": "boolean",
                        "list": "array",
                        "dict": "object",
                    }
                    parameters["properties"][arg_name] = {
                        "type": type_mapping.get(arg_type, "string")
                    }
                else:
                    # Default to string if no type annotation
                    parameters["properties"][arg_name] = {"type": "string"}

            # Parse return type
            returns = {"type": "string"}  # Default return type
            if func_def.returns and isinstance(func_def.returns, ast.Name):
                return_type = func_def.returns.id.lower()
                type_mapping = {
                    "str": "string",
                    "int": "integer",
                    "float": "number",
                    "bool": "boolean",
                    "list": "array",
                    "dict": "object",
                }
                returns["type"] = type_mapping.get(return_type, "string")

            return {"docstring": docstring, "parameters": parameters, "returns": returns}

        except Exception as e:
            raise ValidationError(f"Invalid function content: {str(e)}")

    def execute_tool(self, tool_id: int, args: Dict) -> any:
        """Execute a tool with given arguments"""
        tool = self.get_tool(tool_id)

        try:
            # Create a new namespace for the function
            namespace = {}

            # Execute the function code in the namespace
            exec(tool.function_content, namespace)

            # Get the function from the namespace
            func_name = ast.parse(tool.function_content).body[0].name
            func = namespace[func_name]

            # Execute the function with the provided arguments
            return func(**args)

        except Exception as e:
            self.logger.error(f"Error executing tool {tool.name}: {str(e)}")
            raise ServiceError(f"Failed to execute tool: {str(e)}")

    def prepare_tools_for_ollama(self, tools: List[Tool]) -> List[Dict[str, Any]]:
        """
        Convert Tool models to Ollama function format

        Args:
            tools: List of Tool models to convert

        Returns:
            List of tool definitions in Ollama format
        """
        try:
            ollama_tools = []
            for tool in tools:
                if not tool.is_enabled:
                    continue

                ollama_tool = {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.parameters,
                        "returns": tool.returns,
                    },
                }
                ollama_tools.append(ollama_tool)
            return ollama_tools

        except Exception as e:
            self.logger.error(f"Error preparing tools for Ollama: {str(e)}")
            raise ServiceError(f"Failed to prepare tools: {str(e)}")

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any], user: "CustomUser") -> Any:
        """
        Execute a tool with the given arguments

        Args:
            tool_name: Name of the tool to execute
            arguments: Arguments to pass to the tool
            user: User executing the tool

        Returns:
            Result of tool execution
        """
        try:
            # Get the tool
            tool = self.repository.get_by_name_and_user(tool_name, user.id)
            if not tool:
                raise ValidationError(f"Tool {tool_name} not found")

            if not tool.is_enabled:
                raise ValidationError(f"Tool {tool_name} is disabled")

            # Create execution environment
            local_vars = {}

            # Execute the function content
            exec(tool.function_content, {}, local_vars)

            # Get the function
            func = local_vars.get(tool_name)
            if not func:
                raise ValidationError(f"Function {tool_name} not found in tool content")

            # Validate arguments against schema
            self._validate_arguments(arguments, tool.parameters)

            # Execute function
            result = func(**arguments)

            # Validate return value
            self._validate_return_value(result, tool.returns)

            return result

        except Exception as e:
            self.logger.error(f"Error executing tool {tool_name}: {str(e)}")
            raise ServiceError(f"Failed to execute tool: {str(e)}")

    def handle_tool_call(
        self, tool_calls: List[Dict[str, Any]], user: "CustomUser"
    ) -> List[Dict[str, Any]]:
        """
        Handle tool calls from Ollama

        Args:
            tool_calls: List of tool calls from Ollama
            user: User making the request

        Returns:
            List of tool results
        """
        try:
            results = []
            for tool_call in tool_calls:
                tool_name = tool_call["function"]["name"]
                arguments = json.loads(tool_call["function"]["arguments"])

                try:
                    result = self.execute_tool(tool_name, arguments, user)
                    results.append(
                        {"tool_call_id": tool_call["id"], "name": tool_name, "result": result}
                    )
                except Exception as e:
                    results.append(
                        {"tool_call_id": tool_call["id"], "name": tool_name, "error": str(e)}
                    )

            return results

        except Exception as e:
            self.logger.error(f"Error handling tool calls: {str(e)}")
            raise ServiceError(f"Failed to handle tool calls: {str(e)}")

    def _validate_arguments(self, arguments: Dict[str, Any], schema: Dict[str, Any]):
        """Validate arguments against JSON schema"""
        try:
            # Check required parameters
            required = schema.get("required", [])
            for param in required:
                if param not in arguments:
                    raise ValidationError(f"Missing required parameter: {param}")

            # Validate types
            properties = schema.get("properties", {})
            for param, value in arguments.items():
                if param in properties:
                    expected_type = properties[param]["type"]
                    self._validate_type(value, expected_type, param)

        except Exception as e:
            raise ValidationError(f"Invalid arguments: {str(e)}")

    def _validate_return_value(self, value: Any, schema: Dict[str, Any]):
        """Validate return value against JSON schema"""
        try:
            expected_type = schema.get("type", "string")
            self._validate_type(value, expected_type, "return value")

        except Exception as e:
            raise ValidationError(f"Invalid return value: {str(e)}")

    def _validate_type(self, value: Any, expected_type: str, name: str):
        """Validate value against expected type"""
        type_mapping = {
            "string": str,
            "integer": int,
            "number": (int, float),
            "boolean": bool,
            "array": list,
            "object": dict,
        }

        if expected_type in type_mapping:
            expected_python_type = type_mapping[expected_type]
            if not isinstance(value, expected_python_type):
                raise ValidationError(
                    f"Invalid type for {name}: expected {expected_type}, got {type(value).__name__}"
                )
