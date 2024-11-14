import axios from 'axios';
import { toast } from 'react-toastify';

export const exportProject = async (projectTitle, todos) => {
    const completedTodos = todos.filter(todo => todo.status);
    const pendingTodos = todos.filter(todo => !todo.status);


  const markdownContent = `
# ${projectTitle}

**Summary**: ${completedTodos.length}/${todos.length} todos completed

## Pending
${pendingTodos.map((todo) => `- [ ] ${todo.description}`).join('\n')}

## Completed
${completedTodos.map((todo) => `- [x] ${todo.description}`).join('\n')}
  `;

  try {
    const response = await axios.post(
      'https://api.github.com/gists',
      {
        description: `Summary of ${projectTitle}`,
        public: false,
        files: {
          'project_summary.md': {
            content: markdownContent,
          },
        },
      },
      {
        headers: {
          Authorization: `token $(replace with token)`, 
        },
      }
    );

    const gistUrl = response.data.html_url;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectTitle}_summary.md`;
    link.click();

    toast.success('Gist created successfully!');
  } catch (error) {
    toast.error('Failed to create gist. Please check your GitHub token and try again.');
  }
};
