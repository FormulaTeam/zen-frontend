import { z } from 'zod';

export const checkboxFieldSchema = () => {
  return z.boolean({
    message: 'ערך לא חוקי',
  });
};
