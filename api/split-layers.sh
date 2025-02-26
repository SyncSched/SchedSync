#!/bin/bash

# Directory to store layers
LAYERS_DIR="layers"
mkdir -p $LAYERS_DIR

# Initialize variables
LAYER_INDEX=1
CURRENT_SIZE=0
MAX_LAYER_SIZE=250000000  # 250 MB in bytes

# Create the first layer directory
mkdir -p "$LAYERS_DIR/layer$LAYER_INDEX/nodejs/node_modules"

# Loop through all dependencies in node_modules
for DEPENDENCY in $(ls -1 node_modules); do
  DEPENDENCY_SIZE=$(du -sb "node_modules/$DEPENDENCY" | cut -f1)

  # If adding this dependency exceeds the layer size limit, create a new layer
  if (( CURRENT_SIZE + DEPENDENCY_SIZE > MAX_LAYER_SIZE )); then
    LAYER_INDEX=$((LAYER_INDEX + 1))
    CURRENT_SIZE=0
    mkdir -p "$LAYERS_DIR/layer$LAYER_INDEX/nodejs/node_modules"
  fi

  # Copy the dependency to the current layer
  cp -r "node_modules/$DEPENDENCY" "$LAYERS_DIR/layer$LAYER_INDEX/nodejs/node_modules/"
  CURRENT_SIZE=$((CURRENT_SIZE + DEPENDENCY_SIZE))
done

# Zip and publish each layer
for ((i = 1; i <= LAYER_INDEX; i++)); do
  cd "$LAYERS_DIR/layer$i"
  zip -r "layer$i.zip" nodejs
  LAYER_ARN=$(aws lambda publish-layer-version \
    --layer-name "schedsync-layer-$i" \
    --zip-file "fileb://layer$i.zip" \
    --compatible-runtimes "nodejs22.x" \
    --query 'LayerVersionArn' \
    --output text)
  echo "LAYER${i}_ARN=$LAYER_ARN" >> $GITHUB_ENV
  cd ../..
done