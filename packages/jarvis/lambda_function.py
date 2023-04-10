import json
import boto3

def lambda_handler(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key'] 
    s3 = boto3.client('s3')
    response = s3.get_object(Bucket=bucket, Key=key)
    content_type = response['ContentType']
    file_content = response['Body'].read()
    
    # Split the file into pages
    page_size = 1024
    pages = [file_content[i:i+page_size] for i in range(0, len(file_content), page_size)]
    
    # Upload the pages to S3
    for page_num, page in enumerate(pages):
        page_key = key + '_page_' + str(page_num)
        s3.