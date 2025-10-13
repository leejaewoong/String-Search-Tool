import simpleGit, { SimpleGit } from 'simple-git';

class GitService {
  async pull(folderPath: string): Promise<void> {
    const git: SimpleGit = simpleGit(folderPath);
    await git.pull();
  }

  async getLastCommitTime(folderPath: string): Promise<string> {
    try {
      const git: SimpleGit = simpleGit(folderPath);
      const log = await git.log({ maxCount: 1 });

      if (log.latest) {
        return new Date(log.latest.date).toLocaleString('ko-KR');
      }
    } catch (error) {
      console.error('Git log 조회 실패:', error);
    }

    return '';
  }
}

export const gitService = new GitService();
