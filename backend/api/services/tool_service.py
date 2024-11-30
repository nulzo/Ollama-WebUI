import ast
import inspect
from typing import Dict, List, Optional
from api.repositories.tool_repository import ToolRepository
from api.models.tools.tools import Tool
from api.utils.exceptions import ValidationError, ServiceError
from django.contrib.auth import get_user_model
import logging

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

    def update_tool(self, tool_id: int, user: User, data: dict) -> Tool:
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

    def delete_tool(self, tool_id: int, user: User) -> bool:
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
            parameters = {
                "type": "object",
                "required": [],
                "properties": {}
            }
            
            for arg in func_def.args.args:
                arg_name = arg.arg
                parameters["required"].append(arg_name)
                
                # Try to get type annotation if it exists
                if arg.annotation and isinstance(arg.annotation, ast.Name):
                    arg_type = arg.annotation.id.lower()
                    # Map Python types to JSON schema types
                    type_mapping = {
                        'str': 'string',
                        'int': 'integer',
                        'float': 'number',
                        'bool': 'boolean',
                        'list': 'array',
                        'dict': 'object'
                    }
                    parameters["properties"][arg_name] = {
                        "type": type_mapping.get(arg_type, 'string')
                    }
                else:
                    # Default to string if no type annotation
                    parameters["properties"][arg_name] = {
                        "type": "string"
                    }

            # Parse return type
            returns = {"type": "string"}  # Default return type
            if func_def.returns and isinstance(func_def.returns, ast.Name):
                return_type = func_def.returns.id.lower()
                type_mapping = {
                    'str': 'string',
                    'int': 'integer',
                    'float': 'number',
                    'bool': 'boolean',
                    'list': 'array',
                    'dict': 'object'
                }
                returns["type"] = type_mapping.get(return_type, 'string')

            return {
                "docstring": docstring,
                "parameters": parameters,
                "returns": returns
            }

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