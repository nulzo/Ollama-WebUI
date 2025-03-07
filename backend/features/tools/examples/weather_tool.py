def get_weather(city: str, units: str = "metric") -> str:
    """
    Get the current weather for a city.
    
    Args:
        city: The name of the city to get weather for
        units: The units to use (metric or imperial)
        
    Returns:
        A string with the weather information
    """
    # This is a mock implementation that doesn't actually call a weather API
    # In a real implementation, you would call a weather API here
    weather_data = {
        "New York": {"temp": 22, "condition": "Sunny", "humidity": 60},
        "London": {"temp": 18, "condition": "Cloudy", "humidity": 70},
        "Tokyo": {"temp": 28, "condition": "Rainy", "humidity": 80},
        "Paris": {"temp": 20, "condition": "Partly Cloudy", "humidity": 65},
        "Sydney": {"temp": 25, "condition": "Clear", "humidity": 55},
    }
    
    # Default weather if city not found
    default_weather = {"temp": 20, "condition": "Unknown", "humidity": 50}
    
    # Get weather for the city (case insensitive)
    city_weather = None
    for known_city in weather_data:
        if known_city.lower() == city.lower():
            city_weather = weather_data[known_city]
            break
    
    if not city_weather:
        city_weather = default_weather
        
    # Adjust temperature based on units
    temp = city_weather["temp"]
    if units.lower() == "imperial":
        temp = round((temp * 9/5) + 32)
        temp_unit = "°F"
    else:
        temp_unit = "°C"
        
    # Format the response
    return f"Weather in {city}: {temp}{temp_unit}, {city_weather['condition']} with {city_weather['humidity']}% humidity" 