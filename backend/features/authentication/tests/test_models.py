import pytest
from features.authentication.models import CustomUser, Settings

@pytest.mark.django_db
class TestCustomUser:
    def test_create_user(self, test_user_data):
        user = CustomUser.objects.create_user(
            username=test_user_data['username'],
            email=test_user_data['email'],
            password=test_user_data['password'],
            name=test_user_data['name']
        )
        
        assert user.username == test_user_data['username']
        assert user.email == test_user_data['email']
        assert user.name == test_user_data['name']
        assert user.check_password(test_user_data['password'])

    def test_create_superuser(self):
        superuser = CustomUser.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            name='Admin User'
        )
        
        assert superuser.is_superuser
        assert superuser.is_staff

@pytest.mark.django_db
class TestSettings:
    def test_create_settings(self, test_user):
        settings = Settings.objects.create(
            user=test_user,
            theme='light',
            default_model='gpt-4'
        )
        
        assert settings.user == test_user
        assert settings.theme == 'light'
        assert settings.default_model == 'gpt-4'