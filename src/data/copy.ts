export const lede =
  'A place to ask questions, grow in faith, and find your next step. There is room for you at The Well.';

export const body =
  'Whether you are exploring faith or looking for a church to call home, start here. Get to know The Well, explore our beliefs, and discover ways to connect.';

export const more =
  'You do not have to have every answer before taking the first step. Come with your questions and begin a conversation.';

/** Keep the original sample records while presenting honest, readable preview copy. */
export function isPlaceholderText(value = ''): boolean {
  return /lorem ipsum|ut enim ad minim|duis aute|excepteur sint|sed do eiusmod|quis nostrud|sunt in culpa/i.test(value);
}
