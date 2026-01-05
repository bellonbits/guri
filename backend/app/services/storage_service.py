import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
import uuid
import os
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_key_id=settings.S3_SECRET_KEY,
            use_ssl=settings.S3_USE_SSL,
            region_name=settings.S3_REGION
        )
        self.bucket = settings.S3_BUCKET

    async def upload_file(self, file: UploadFile, folder: str = "properties") -> str:
        """
        Uploads a file to MinIO/S3 and returns the URL.
        """
        file_extension = os.path.splitext(file.filename)[1]
        file_key = f"{folder}/{uuid.uuid4()}{file_extension}"
        
        try:
            # Upload the file
            content = await file.read()
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=file_key,
                Body=content,
                ContentType=file.content_type
            )
            
            # Reset file pointer just in case
            await file.seek(0)
            
            # Construct URL
            base_url = settings.S3_PUBLIC_URL_OVERRIDE or settings.S3_ENDPOINT
            return f"{base_url}/{self.bucket}/{file_key}"
            
        except ClientError as e:
            logger.error(f"S3 upload error: {e}")
            raise Exception("Failed to upload file to storage")
        except Exception as e:
            logger.error(f"Unexpected storage error: {e}")
            raise Exception(f"Internal storage error: {str(e)}")

storage_service = StorageService()
