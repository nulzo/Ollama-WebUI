import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
import tempfile
from PIL import Image
from features.authentication.models import CustomUser

@pytest.fixture
def temp_image():
    image = Image.new('RGB', (100, 100))
    tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
    image.save(tmp_file)
    tmp_file.seek(0)
    return tmp_file

@pytest.mark.django_db
class TestUserViewSet:
    def test_get_profile(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)
        url = reverse('users-profile')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['email'] == test_user.email

    def test_update_profile(self, api_client, test_user, temp_image):
        api_client.force_authenticate(user=test_user)
        url = reverse('users-update-profile')
        update_data = {
            'name': 'Updated Name',
            'description': 'New description',
            'icon': temp_image
        }
        response = api_client.patch(url, update_data, format='multipart')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['name'] == 'Updated Name'

    def test_delete_account(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)
        url = reverse('users-delete-account')
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert not CustomUser.objects.filter(id=test_user.id).exists()

    def test_unauthorized_access(self, api_client):
        url = reverse('users-profile')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED