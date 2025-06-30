#!/bin/bash

echo "Setting up release branches for Personal Hub Frontend"
echo "====================================================="

# Ensure we're on main branch and up to date
echo "1. Updating main branch..."
git checkout main
git pull origin main

# Create staging branch
echo -e "\n2. Creating staging branch..."
git checkout -b staging
git push -u origin staging
echo "✅ Staging branch created"

# Create production branch
echo -e "\n3. Creating production branch..."
git checkout main
git checkout -b production
git push -u origin production
echo "✅ Production branch created"

# Return to main
echo -e "\n4. Returning to main branch..."
git checkout main

echo -e "\n✅ Branch setup complete!"
echo "Branches created:"
echo "  - main (development)"
echo "  - staging (pre-production)"
echo "  - production (stable releases)"

echo -e "\nNext steps:"
echo "1. Configure Vercel to deploy from these branches"
echo "2. Set up branch protection rules on GitHub"
echo "3. Configure environment-specific variables in Vercel"