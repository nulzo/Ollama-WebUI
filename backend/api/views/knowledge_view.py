from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.serializers.knowledge import KnowledgeSerializer
from api.services.knowledge_service import KnowledgeService
from api.utils.exceptions import NotFoundException
from api.utils.responses.response import api_response


class KnowledgeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing knowledge documents."""

    serializer_class = KnowledgeSerializer
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = KnowledgeService()

    def get_queryset(self):
        """Get all knowledge documents for the current user"""
        return self.service.list_knowledge(self.request.user.id)

    def list(self, request, *args, **kwargs):
        """Get all knowledge documents"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(data=serializer.data, request=request)

    def retrieve(self, request, *args, **kwargs):
        """Get a single knowledge document"""
        try:
            knowledge = self.service.get_knowledge(
                knowledge_id=kwargs["pk"], user_id=request.user.id
            )
            serializer = self.get_serializer(knowledge)
            return api_response(data=serializer.data, request=request)
        except NotFoundException as e:
            return api_response(
                error={"code": "KNOWLEDGE_NOT_FOUND", "message": str(e)},
                status=status.HTTP_404_NOT_FOUND,
                request=request,
            )
        except Exception as e:
            return api_response(
                error={
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                request=request,
            )

    def create(self, request, *args, **kwargs):
        """Create a new knowledge document"""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid data provided",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
                request=request,
            )

        try:
            knowledge = self.service.create_knowledge(serializer.validated_data, request.user)
            serializer = self.get_serializer(knowledge)
            return api_response(
                data=serializer.data, status=status.HTTP_201_CREATED, request=request
            )
        except Exception as e:
            return api_response(
                error={
                    "code": "CREATION_ERROR",
                    "message": "Failed to create knowledge document",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                request=request,
            )

    def update(self, request, *args, **kwargs):
        """Update an existing knowledge document"""
        try:
            # First check if the knowledge exists and belongs to user
            self.service.get_knowledge(knowledge_id=kwargs["pk"], user_id=request.user.id)

            serializer = self.get_serializer(data=request.data, partial=True)
            if not serializer.is_valid():
                return api_response(
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid data provided",
                        "details": serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                    request=request,
                )

            knowledge = self.service.update_knowledge(
                knowledge_id=kwargs["pk"], data=serializer.validated_data, user_id=request.user.id
            )

            serializer = self.get_serializer(knowledge)
            return api_response(data=serializer.data, request=request)

        except NotFoundException as e:
            return api_response(
                error={"code": "KNOWLEDGE_NOT_FOUND", "message": str(e)},
                status=status.HTTP_404_NOT_FOUND,
                request=request,
            )
        except Exception as e:
            return api_response(
                error={
                    "code": "UPDATE_ERROR",
                    "message": "Failed to update knowledge document",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                request=request,
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a knowledge document"""
        try:
            self.service.delete_knowledge(knowledge_id=kwargs["pk"], user_id=request.user.id)
            return api_response(
                data={"message": "Knowledge document successfully deleted"},
                status=status.HTTP_200_OK,
                request=request,
            )
        except NotFoundException as e:
            return api_response(
                error={"code": "KNOWLEDGE_NOT_FOUND", "message": str(e)},
                status=status.HTTP_404_NOT_FOUND,
                request=request,
            )
        except Exception as e:
            return api_response(
                error={
                    "code": "DELETE_ERROR",
                    "message": "Failed to delete knowledge document",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                request=request,
            )

    @action(detail=False, methods=["post"])
    def search(self, request):
        """Search knowledge documents by similarity"""
        query = request.data.get("query")
        max_results = request.data.get("max_results", 3)

        if not query:
            return api_response(
                error={"code": "VALIDATION_ERROR", "message": "Query is required"},
                status=status.HTTP_400_BAD_REQUEST,
                request=request,
            )

        try:
            results = self.service.find_relevant_context(query, self.request.user.id, max_results)
            return api_response(data=results, request=request)
        except Exception as e:
            return api_response(
                error={
                    "code": "SEARCH_ERROR",
                    "message": "Failed to search knowledge documents",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                request=request,
            )

    @action(detail=True, methods=["get"])
    def embeddings(self, request, pk=None):
        """Get embeddings for a specific knowledge document"""
        try:
            embeddings = self.service.get_embeddings(knowledge_id=pk, user_id=request.user.id)
            return api_response(
                data={
                    "knowledge_id": pk,
                    "embeddings": (
                        embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings
                    ),
                },
                request=request,
            )
        except NotFoundException as e:
            return api_response(
                error={"code": "KNOWLEDGE_NOT_FOUND", "message": str(e)},
                status=status.HTTP_404_NOT_FOUND,
                request=request,
            )
        except Exception as e:
            return api_response(
                error={
                    "code": "EMBEDDING_FETCH_ERROR",
                    "message": "Failed to fetch embeddings",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                request=request,
            )
