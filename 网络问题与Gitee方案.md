# 无法连接 GitHub 时的解决方案

报错含义：本机**连不上** `github.com` 的 443 端口（HTTPS），常见于国内网络未开代理/VPN。

本地代码**没有丢失**，只是暂时推不上去。

---

## 方案一：开代理后再 Push（继续用 GitHub）

若你有 VPN / Clash / V2Ray 等：

### 1. 先确认代理已开启

浏览器能打开 https://github.com 再继续。

### 2. GitHub Desktop 使用系统代理

**File → Options → Git**  
勾选与代理相关的选项（若有 **Use system proxy** 则勾选）。

### 3. 或在终端为 Git 设置代理（仅当你知道代理端口）

常见端口：`7890`、`7897`、`10809`（以你的软件为准）

在 **PowerShell** 执行（把 `7890` 换成你的端口）：

```powershell
$git = "$env:LOCALAPPDATA\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe"
& $git config --global http.proxy http://127.0.0.1:7890
& $git config --global https.proxy http://127.0.0.1:7890
```

然后在 GitHub Desktop 点 **Push origin**。

取消代理：

```powershell
& $git config --global --unset http.proxy
& $git config --global --unset https.proxy
```

---

## 方案二：改用 Gitee（码云）— 国内推荐

无需访问 GitHub，同样能**免费发布网页**，得到 `https://xxx.gitee.io/...` 网址。

### 步骤

1. 打开 https://gitee.com 注册并登录  
2. 右上角 **+** → **新建仓库**  
   - 名称：`share-board`  
   - 选 **公开**  
   - **不要**勾选「使用 Readme 初始化」  
3. 打开 **GitHub Desktop**（仍可用它推送到 Gitee）  
4. **Repository → Repository settings → Remote**  
   - 将地址改为（把 `你的用户名` 换成 Gitee 用户名）：
   ```
   https://gitee.com/你的用户名/share-board.git
   ```
5. **Push origin**（首次会要求登录 Gitee 账号）

### 开启 Gitee Pages

1. 进入 Gitee 仓库 → **服务** → **Gitee Pages**  
2. 选分支 `main`，部署目录 `/`  
3. 点 **启动** / **更新**  
4. 访问：`https://你的用户名.gitee.io/share-board/`

| 页面 | 地址 |
|------|------|
| 首页 | `.../share-board/` |
| 分享墙 | `.../share-board/分享墙.html` |
| 云端版 | `.../share-board/分享墙-云端.html` |

> Gitee Pages 免费版有时需手动点「更新」才会刷新；个人使用足够。

---

## 方案三：不用 Git，网页直接上传

若 Git 仍失败，可在 Gitee **网页端**上传：

1. 新建空仓库 `share-board`  
2. 仓库页 **上传文件**  
3. 把 `share-board` 文件夹里所有文件拖进去（可跳过 `.git` 文件夹）  
4. 提交后同样去 **Gitee Pages** 开启

---

## 你当前的 GitHub 仓库

远程地址：`https://github.com/Nanbian525/share-board-Nanbian525.git`

网络恢复或使用代理后，在 GitHub Desktop **Push** 即可，无需重新创建本地项目。

---

## 建议

| 情况 | 建议 |
|------|------|
| 偶尔用、有 VPN | 开代理后 Push 到 GitHub |
| 长期在国内、要给他人固定链接 | **Gitee Pages** 更稳定 |
| 完全不想折腾 Git | Gitee 网页上传 + Pages |
