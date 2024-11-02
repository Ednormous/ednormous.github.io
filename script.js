// Mobile Navigation Toggle
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Fetch GitHub Repositories
const repoList = document.getElementById('repo-list');
const githubUsername = 'your-github-username'; // Replace with your GitHub username

fetch(`https://api.github.com/users/${githubUsername}/repos`)
    .then(response => response.json())
    .then(data => {
        data.forEach(repo => {
            const repoItem = document.createElement('div');
            repoItem.classList.add('repo');
            repoItem.innerHTML = `
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || 'No description available.'}</p>
            `;
            repoList.appendChild(repoItem);
        });
    })
    .catch(error => {
        console.error('Error fetching repositories:', error);
        repoList.innerHTML = '<p>Unable to load repositories.</p>';
    });
