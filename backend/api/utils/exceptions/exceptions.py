class ServiceError(Exception):
    """Base exception for all service errors"""
    def __init__(self, message: str = None, code: str = None):
        self.message = message or "An unexpected error occurred"
        self.code = code or "service_error"
        super().__init__(self.message)


class NotFoundException(ServiceError):
    """Raised when a requested resource is not found"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, code="not_found")


class ProviderException(ServiceError):
    """Raised when a provider has not been registered"""
    def __init__(self, message: str = "Provider has not been registered"):
        super().__init__(message=message, code="provider_error")


class ValidationError(ServiceError):
    """Raised when data validation fails"""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message=message, code="validation_error")


class AuthenticationError(ServiceError):
    """Raised when authentication fails"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message=message, code="authentication_error")


class PermissionDeniedError(ServiceError):
    """Raised when user doesn't have required permissions"""
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message=message, code="permission_denied")
