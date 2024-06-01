# Project Deployment Instructions

This document outlines the steps to deploy the project.

## SSH Access

1. Open your terminal.
2. Connect to the server using SSH:
   ```sh
   ssh root@1.22.34.44
   ```
   When prompted, enter the password for the root user.

## Navigating the Directory

1. To list the contents of the current directory:
   ```sh
   ls
   ```

2. Navigate to the directory you want to update:
   ```sh
   cd /path/to/your/directory
   ```

## Updating the Code

1. Pull the latest changes from the current branch or main branch:
   ```sh
   git pull origin <branch-name>
   ```
   Replace `<branch-name>` with the name of the branch you want to pull from (e.g., main).

## Building the Project

1. Run the build command:
   ```sh
   npm run build
   ```

## Summary

1. SSH into the server
2. Navigate to the desired directory
3. Pull the latest code from the repository
4. Build the project using npm

By following these steps, you can ensure that your project is updated and built correctly before deployment.

You can save this content in a file named `README.md`. This file will serve as a comprehensive guide for deploying the project.

## Starting the Project

To start the project, run the following command:
   ```sh
   npm start
   ```