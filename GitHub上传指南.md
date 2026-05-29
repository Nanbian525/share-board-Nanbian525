# GitHub 上传与发布指南（GitHub Desktop）

## 第一步：在 GitHub Desktop 添加本仓库

1. 打开 **GitHub Desktop**
2. 菜单 **File（文件）** → **Add local repository（添加本地仓库）**
3. 点击 **Choose…**，选择文件夹：
   ```
   C:\Users\Nan bian\Desktop\ai 编程\share-board
   ```
4. 若提示「This directory does not appear to be a Git repository」，点 **create a repository** 或 **Add repository**（本地已初始化，一般直接添加即可）

## 第二步：登录 GitHub

1. **File** → **Options** → **Accounts**
2. 点 **Sign in to GitHub.com**，按提示在浏览器完成登录

## 第三步：发布到 GitHub

1. 在 GitHub Desktop 左上角确认当前仓库为 `share-board`
2. 左下角 **Summary** 可看到已提交的「分享墙初始版本」
3. 点击顶部 **Publish repository（发布仓库）**
4. 填写：
   - **Name**：`share-board`（或你喜欢的名字）
   - **Description**：可选，如「图文链接分享墙」
   - **Keep this code private**：私人用可勾选；公开分享则取消勾选
5. 点 **Publish Repository**

完成后可在 GitHub 网站看到你的文件。

## 第四步：开启 GitHub Pages（获得网址）

1. 浏览器打开 https://github.com ，进入刚发布的仓库
2. **Settings** → 左侧 **Pages**
3. **Build and deployment** → **Source** 选 **Deploy from a branch**
4. **Branch** 选 `main`（或 `master`），文件夹选 **/ (root)**，点 **Save**
5. 等待 1～3 分钟，页面会显示网址，例如：
   ```
   https://你的用户名.github.io/share-board/
   ```

## 页面地址

| 页面 | 地址 |
|------|------|
| 本机离线版 | `https://你的用户名.github.io/share-board/分享墙.html` |
| 云端协作版 | `https://你的用户名.github.io/share-board/分享墙-云端.html` |
| 首页（自动跳转） | `https://你的用户名.github.io/share-board/` |

## 以后更新文件

1. 修改本地 `share-board` 里的文件
2. 打开 GitHub Desktop，会看到变更列表
3. 左下角填写说明，点 **Commit to main**
4. 点 **Push origin** 推送到 GitHub
5. Pages 会自动更新（约 1～2 分钟）

## 常见问题

**Q：Add local repository 找不到文件夹？**  
直接粘贴路径：`C:\Users\Nan bian\Desktop\ai 编程\share-board`

**Q：Publish 按钮是灰的？**  
先确认左下角已 Commit；或 **Repository** → **Repository settings** 检查远程是否已配置。

**Q：Pages 404？**  
确认 Branch 为 `main`、根目录有 `index.html`，并等待几分钟再刷新。
