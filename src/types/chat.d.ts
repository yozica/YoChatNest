// 聊天信息类型
export type ChatCacheType = {
  id: number;
  clientId: string;
  nickname: string;
  type: 'text' | 'userAction';
  data: string;
  time: string;
};
