def calculate(operation: str, a: float, b: float) -> str:
    """
    Perform a basic mathematical operation on two numbers.
    
    Args:
        operation: The operation to perform (add, subtract, multiply, divide)
        a: The first number
        b: The second number
        
    Returns:
        A string with the result of the calculation
    """
    operation = operation.lower()
    
    if operation == "add":
        result = a + b
        symbol = "+"
    elif operation == "subtract":
        result = a - b
        symbol = "-"
    elif operation == "multiply":
        result = a * b
        symbol = "×"
    elif operation == "divide":
        if b == 0:
            return "Error: Cannot divide by zero"
        result = a / b
        symbol = "÷"
    else:
        return f"Error: Unknown operation '{operation}'. Please use add, subtract, multiply, or divide."
    
    # Format the result to remove trailing zeros for whole numbers
    if result == int(result):
        result = int(result)
    
    return f"{a} {symbol} {b} = {result}" 