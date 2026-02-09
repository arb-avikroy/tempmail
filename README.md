# Welcome to Temp mail

## Project info

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Features

### YopMail Domain Rotation

This application automatically fetches and rotates YopMail domains daily from the [YopMail email generator](https://yopmail.com/email-generator). 

- **Daily Domain Updates**: The app fetches the latest "New" domain from YopMail each day
- **Fallback Domains**: Includes a comprehensive list of 200+ alternate domains
- **Smart Caching**: Domains are cached locally and refreshed once per day
- **Avoid Blacklisting**: By using rotating domains, temporary email addresses are less likely to be blocked by websites

The domain list is automatically fetched from YopMail's API and cached for optimal performance.
