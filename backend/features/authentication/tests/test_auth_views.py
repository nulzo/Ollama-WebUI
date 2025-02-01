import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from features.authentication.models import CustomUser

@pytest.mark.django_db
class TestAuthViewSet:
    def test_register_success(self, api_client, test_user_data):
        url = reverse('auth-register')
        response = api_client.post(url, test_user_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'token' in response.data['data']
        assert 'user' in response.data['data']
        assert response.data['data']['user']['email'] == test_user_data['email']

    def test_register_duplicate_username(self, api_client, test_user, test_user_data):
        url = reverse('auth-register')
        response = api_client.post(url, test_user_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data

    def test_login_success(self, api_client, test_user, test_user_data):
        url = reverse('auth-login')
        credentials = {
            'username': test_user_data['username'],
            'password': test_user_data['password']
        }
        response = api_client.post(url, credentials, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data['data']
        assert 'user' in response.data['data']

    def test_login_invalid_credentials(self, api_client):
        url = reverse('auth-login')
        credentials = {
            'username': 'wronguser',
            'password': 'wrongpass'
        }
        response = api_client.post(url, credentials, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)
        url = reverse('auth-logout')
        response = api_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK