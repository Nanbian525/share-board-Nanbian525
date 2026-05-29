// 云端同步配置（配置一次后 Push 到 GitHub，手机/电脑打开同一网址即可共享）
// 获取方式：Supabase 控制台 → Project Settings → API
window.SHARE_BOARD_CLOUD = {
  url: "",   // 例如 "https://abcdefgh.supabase.co"
  key: "",   // anon public 密钥，eyJ 开头
  board: "main",  // 房间号，所有人须一致；也可在网址加 ?board=xxx
};
