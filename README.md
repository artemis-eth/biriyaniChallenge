# GitHub Commits Leaderboard

A beautiful, customizable leaderboard application that tracks GitHub commit activity and creates friendly competition among developers.

## Features

- 🏆 **Real-time Leaderboard**: Track commits from the last 30 days across all public repositories
- 🎨 **Customizable Themes**: Built-in biriyani challenge theme with easy customization
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Fast & Lightweight**: Static deployment with no backend required
- 🔒 **Secure**: Uses GitHub Personal Access Tokens for API access
- 🎯 **GitHub Integration**: Direct validation and data fetching from GitHub API

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd github-leaderboard
npm install
```

### 2. Set up GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Leaderboard App"
4. Select the `public_repo` scope
5. Generate and copy the token

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your GitHub token:

```
VITE_GITHUB_TOKEN=your_github_token_here
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to see your leaderboard!

## Deployment

This application is designed for static hosting and works perfectly with:

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variable:
   - Name: `VITE_GITHUB_TOKEN`
   - Value: Your GitHub Personal Access Token
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable:
   - Name: `VITE_GITHUB_TOKEN`
   - Value: Your GitHub Personal Access Token
6. Deploy!

## Customization

### Theme Configuration

The application comes with a biriyani challenge theme, but you can easily customize it by modifying the theme object in `src/hooks/useTheme.ts`:

```typescript
const defaultTheme: Theme = {
  name: 'Your Challenge Name',
  primaryColor: '#3B82F6',
  accentColor: '#8B5CF6',
  backgroundColor: '#F8FAFC',
  rewardMessage: 'Your reward message here!',
  labels: {
    title: 'Your Leaderboard Title',
    subtitle: 'Your subtitle',
    commitLabel: 'Points', // or 'Commits', 'Contributions', etc.
    rankLabel: 'Rank',
    leaderboardTitle: 'Leaderboard'
  }
};
```

### Adding Custom Components

The application uses a modular structure. You can add custom components in the `src/components/` directory and themed elements in `src/components/BiryaniElements.tsx`.

## How It Works

1. **Registration**: Users enter their GitHub username, which is validated against the GitHub API
2. **Data Fetching**: The app fetches all public repositories for registered users
3. **Commit Counting**: Counts commits from the last 30 days across all repositories
4. **Ranking**: Users are ranked by their total commit count
5. **Real-time Updates**: Data can be refreshed manually to get the latest commit counts

## Technical Details

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme system
- **State Management**: Simple in-memory store (non-persistent)
- **API Integration**: Direct GitHub API calls with rate limiting
- **Build Tool**: Vite for fast development and optimized builds

## Rate Limiting

The GitHub API has rate limits:
- **Without token**: 60 requests per hour
- **With token**: 5,000 requests per hour

The application includes rate limit monitoring and will display warnings when limits are approached.

## Data Persistence

In the current static deployment mode, user data is stored in browser memory and will be lost on page refresh. For persistent data storage, you would need to integrate with a backend database service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own competitions and challenges!

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for developer communities everywhere!