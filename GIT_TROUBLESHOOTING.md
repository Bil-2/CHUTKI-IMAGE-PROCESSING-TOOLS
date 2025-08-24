# Git Troubleshooting Guide for CHUTKI Image Tools

## Common Issues and Solutions

### Non-Fast-Forward Error When Pushing

**Error Message:**
```
! [rejected]        main -> main (non-fast-forward) 
error: failed to push some refs to 'https://github.com/Bil-2/CHUTKI-IMAGE-TOOL.git' 
hint: Updates were rejected because the tip of your current branch is behind 
hint: its remote counterpart. Integrate the remote changes (e.g. 
hint: 'git pull ...') before pushing again. 
hint: See the 'Note about fast-forwards' in 'git push --help' for details. 
```

**Solution:**

1. Pull the latest changes from the remote repository:
   ```bash
   git pull origin main
   ```

2. If there are merge conflicts, resolve them in your code editor.

3. After resolving conflicts (if any), commit the changes:
   ```bash
   git add .
   git commit -m "Merge remote changes"
   ```

4. Push your changes again:
   ```bash
   git push origin main
   ```

### Alternative Solutions

**If you want to force push (use with caution):**
```bash
git push -f origin main
```
⚠️ **Warning:** Force pushing overwrites remote history and can cause problems for collaborators. Only use this if you're sure it's appropriate.

**If you want to create a new branch instead:**
```bash
git checkout -b new-branch-name
git push origin new-branch-name
```

## Deployment Workflow Best Practices

1. Always pull before making changes:
   ```bash
   git pull origin main
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. Pull again before pushing to ensure you have the latest changes:
   ```bash
   git pull origin main
   ```

4. Push your changes:
   ```bash
   git push origin main
   ```

5. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)