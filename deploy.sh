#!/bin/bash
# deploy.sh - Comprehensive build and deploy script for sql-compiler

# Exit on error
set -e

# Configuration
APP_NAME="sql-compiler"
REPO_NAME="app-images"
DEFAULT_REGION="us-central1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SQL Compiler Deployment Script ===${NC}"

# 1. Check for gcloud
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it from https://cloud.google.com/sdk"
    exit 1
fi

# 2. Get/Set Project ID
PROJECT_ID=$(gcloud config get-value project --quiet 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    echo "Error: No GCP project ID found. Please run 'gcloud config set project [PROJECT_ID]'"
    exit 1
fi

echo -e "${GREEN}Using GCP Project:${NC} $PROJECT_ID"

# 3. Prepare Artifact Registry
echo -e "\n${BLUE}Preparing Artifact Registry...${NC}"
# Enable APIs
echo "Enabling Artifact Registry and Cloud Build APIs..."
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com --project=$PROJECT_ID

# Create repository if it doesn't exist
if ! gcloud artifacts repositories describe $REPO_NAME --location=$DEFAULT_REGION --project=$PROJECT_ID &>/dev/null; then
    echo "Creating Artifact Registry repository '$REPO_NAME' in $DEFAULT_REGION..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$DEFAULT_REGION \
        --description="Docker repository for applications" \
        --project=$PROJECT_ID
else
    echo "Repository '$REPO_NAME' already exists."
fi

IMAGE_PATH="$DEFAULT_REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$APP_NAME"

# 4. Choose Build Method
METHOD=$1
if [ -z "$METHOD" ]; then
    echo -e "\n${BLUE}Select build method:${NC}"
    echo "1) Cloud Build (Recommended - builds in GCP, no local Docker required)"
    echo "2) Local Build (Uses docker-compose, requires local Docker)"
    read -p "Enter choice [1-2]: " METHOD
fi

case $METHOD in
    1|cloud)
        echo -e "\n${GREEN}Submitting build to Google Cloud Build...${NC}"
        TAG=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
        gcloud builds submit --config cloudbuild.yaml \
            --substitutions=_APP_NAME=$APP_NAME,_TAG=$TAG,_IMAGE_BASE="$DEFAULT_REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME" .
        ;;
    2|local)
        if ! command -v docker-compose &> /dev/null; then
            echo "Error: docker-compose is not installed."
            exit 1
        fi
        echo -e "\n${GREEN}Building locally with docker-compose...${NC}"
        export PROJECT_ID=$PROJECT_ID
        export IMAGE_PATH=$IMAGE_PATH
        docker-compose build
        
        echo -e "\n${GREEN}Pushing image to Artifact Registry...${NC}"
        # Configure docker for Artifact Registry
        gcloud auth configure-docker $DEFAULT_REGION-docker.pkg.dev --quiet
        docker-compose push
        ;;
    *)
        echo "Invalid choice. Use '1', '2', 'cloud', or 'local'."
        exit 1
        ;;
esac

echo -e "\n${GREEN}Build and Push completed successfully for $APP_NAME.${NC}"

# 6. Optional: Deploy to Cloud Run
DEPLOY=$2
if [ -z "$DEPLOY" ]; then
    echo -e "\n${BLUE}Deployment Option:${NC}"
    read -p "Do you want to deploy/update this image to Cloud Run? (y/n): " DEPLOY
fi

if [[ "$DEPLOY" =~ ^[Yy]$ ]] || [[ "$DEPLOY" == "deploy" ]]; then
    # Ask for region only if not provided or if we want to keep it simple
    if [ -t 0 ]; then
        read -p "Enter region [$DEFAULT_REGION]: " REGION
    fi
    REGION=${REGION:-$DEFAULT_REGION}
    
    echo -e "\n${GREEN}Deploying to Cloud Run in $REGION...${NC}"
    gcloud beta run deploy $APP_NAME \
        --image $IMAGE_PATH:latest \
        --platform managed \
        --region $REGION \
        --no-allow-unauthenticated \
    
    echo -e "\n${GREEN}Deployment complete!${NC}"
    gcloud run services describe $APP_NAME --region $REGION --format='value(status.url)'
fi
