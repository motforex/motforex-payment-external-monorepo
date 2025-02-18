 #!/bin/bash

# Array of serverless stack directories
stacks=(
  "../stacks/backoffice-bank-transaction"
  "../stacks/backoffice-merchant"
  "../stacks/client-withdraw"
)

# Function to deploy a serverless stack
deploy_stack() {
  local stack_dir=$1
  echo "Deploying stack in directory: $stack_dir"
  cd "$stack_dir" || exit
  serverless deploy --stage prod
  if [ $? -ne 0 ]; then
    echo "Failed to deploy stack in directory: $stack_dir"
    exit 1
  fi
  cd - || exit
}

# Deploy each stack in the array
for stack in "${stacks[@]}"; do
  deploy_stack "$stack"
done

echo "All stacks deployed successfully."