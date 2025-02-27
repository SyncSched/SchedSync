#!/bin/bash

# Directory to store layers
LAYERS_DIR="layers"
mkdir -p $LAYERS_DIR

# Initialize variables
LAYER_INDEX=1
CURRENT_SIZE=0
MAX_LAYER_SIZE=240000000  # 240 MB in bytes

# Create the first layer directory
mkdir -p "$LAYERS_DIR/layer$LAYER_INDEX/nodejs/node_modules"

# Loop through all dependencies in node_modules
for DEPENDENCY in $(ls -1 node_modules); do
  DEPENDENCY_SIZE=$(du -sb "node_modules/$DEPENDENCY" | cut -f1)
  echo "Processing dependency: $DEPENDENCY (Size: $DEPENDENCY_SIZE bytes)"

  # If adding this dependency exceeds the layer size limit, create a new layer
  if (( CURRENT_SIZE + DEPENDENCY_SIZE > MAX_LAYER_SIZE )); then
    echo "Creating new layer: layer$((LAYER_INDEX + 1))"
    LAYER_INDEX=$((LAYER_INDEX + 1))
    CURRENT_SIZE=0
    mkdir -p "$LAYERS_DIR/layer$LAYER_INDEX/nodejs/node_modules"
  fi

  # Copy the dependency to the current layer
  echo "Adding $DEPENDENCY to layer$LAYER_INDEX"
  cp -r "node_modules/$DEPENDENCY" "$LAYERS_DIR/layer$LAYER_INDEX/nodejs/node_modules/"
  CURRENT_SIZE=$((CURRENT_SIZE + DEPENDENCY_SIZE))
done

# Zip and publish each layer
for ((i = 1; i <= LAYER_INDEX; i++)); do
  echo "Publishing layer$i"
  cd "$LAYERS_DIR/layer$i"
  
  # Debug: Check the contents of the layer
  echo "Contents of layer$i:"
  ls -R nodejs/node_modules
  
  # Zip the layer
  zip -r "layer$i.zip" nodejs
  
  # Publish the layer
  LAYER_ARN=$(aws lambda publish-layer-version \
    --layer-name "schedsync-layer-$i" \
    --zip-file "fileb://layer$i.zip" \
    --compatible-runtimes "nodejs22.x" \
    --query 'LayerVersionArn' \
    --output text)
  
  # Check if the layer was published successfully
  if [ -z "$LAYER_ARN" ]; then
    echo "Failed to publish layer$i"
  else
    echo "LAYER${i}_ARN=$LAYER_ARN" >> $GITHUB_ENV
  fi
  
  cd ../..
done