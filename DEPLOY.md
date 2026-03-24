# 部署指南 - MACE预测系统

本文档介绍如何将MACE预测系统部署为公开可访问的网站。

---

## 方案一：静态网站部署（推荐，最简单）

**优点**：免费、快速、无需服务器维护  
**缺点**：预测逻辑在前端，无法保护算法细节  
**适用场景**：快速演示、学术交流、原型验证

### 部署平台选择

#### 1.1 Vercel (推荐)

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入项目目录
cd mace-prediction-web

# 3. 部署
vercel --prod
```

#### 1.2 Netlify

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 部署
netlify deploy --prod --dir=.
```

#### 1.3 GitHub Pages

1. 将代码推送到GitHub仓库
2. 进入仓库 Settings > Pages
3. Source 选择 "Deploy from a branch"
4. 选择 main 分支和 root 目录
5. 保存后获得 `https://username.github.io/repo-name` 链接

---

## 方案二：Flask后端部署（功能完整）

**优点**：可以保护算法、支持API调用、功能完整  
**缺点**：需要服务器、有一定成本  
**适用场景**：正式临床使用、需要API集成

### 2.1 PythonAnywhere (免费，适合演示)

```bash
# 1. 注册 https://www.pythonanywhere.com/
# 2. 上传项目文件
# 3. 创建Web应用 (Flask)
# 4. WSGI配置路径: /home/username/mace-prediction-web/server.py
# 5. 访问链接: username.pythonanywhere.com
```

### 2.2 Heroku (需要信用卡验证)

```bash
# 1. 安装 Heroku CLI
# 2. 创建 Procfile
echo "web: gunicorn server:app" > Procfile

# 3. 部署
git init
git add .
git commit -m "Initial commit"
heroku create mace-predictor
heroku config:set MODEL_PATH=./models

# 4. 访问链接: https://mace-predictor.herokuapp.com
```

### 2.3 自有服务器/VPS

```bash
# 使用 Gunicorn + Nginx
gunicorn -w 4 -b 0.0.0.0:8000 server:app
```

**Nginx配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static {
        alias /path/to/mace-prediction-web/static;
        expires 30d;
    }
}
```

---

## 方案三：Docker部署（专业环境）

```bash
# 构建镜像
docker build -t mace-predictor .

# 运行容器
docker run -d -p 5000:5000 mace-predictor
```

---

## 快速开始检查清单

### 静态部署
- [ ] 确认所有文件在根目录
- [ ] 测试本地运行 `python3 -m http.server 8080`
- [ ] 注册部署平台账号
- [ ] 执行部署命令
- [ ] 获取公开URL并分享

### Flask后端部署
- [ ] 安装依赖 `pip install -r requirements.txt`
- [ ] 测试本地运行 `python server.py`
- [ ] 选择部署平台
- [ ] 配置环境变量
- [ ] 部署并测试API

---

## 配置建议

### 域名绑定
使用自己的域名看起来更专业：
- Vercel: 在Settings > Domains添加
- Netlify: Domain settings里配置
- PythonAnywhere: 使用CNAME记录

### HTTPS
所有主流平台都自动提供HTTPS，确保数据安全。

### 访问统计
添加Google Analytics追踪访问量：
```html
<!-- 在index.html的<head>中添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
```

---

## 推荐选择

| 场景 | 推荐方案 | 预计时间 |
|------|----------|----------|
| 快速分享给别人看 | Vercel静态部署 | 5分钟 |
| 学术会议展示 | GitHub Pages | 10分钟 |
| 正式临床使用 | PythonAnywhere/自有服务器 | 30分钟 |
| API集成需求 | Heroku/VPS + Flask | 1小时 |

---

## 需要帮助？

如果遇到部署问题，请提供：
1. 选择的部署方案
2. 具体的错误信息
3. 当前操作步骤

祝部署顺利！🔥
