# 网站地图配置说明

## 已创建的文件

### 1. sitemap.xml
- 位置：根目录
- 格式：标准 XML 格式
- 内容：包含网站的主要页面

### 2. robots.txt
- 位置：根目录
- 作用：告诉搜索引擎爬虫如何访问您的网站
- 引用：指向 sitemap.xml 文件

## 需要配置的内容

### 1. 更新域名
将 `sitemap.xml` 和 `robots.txt` 中的 `https://yourdomain.com` 替换为您的实际域名。

例如，如果您的域名是 `https://xiaofeng-ai.com`，则修改为：

**sitemap.xml:**
```xml
<loc>https://xiaofeng-ai.com/</loc>
<loc>https://xiaofeng-ai.com/index.html</loc>
```

**robots.txt:**
```
Sitemap: https://xiaofeng-ai.com/sitemap.xml
```

### 2. 更新日期
将 `sitemap.xml` 中的 `lastmod` 日期更新为当前日期：

```xml
<lastmod>2024-12-19</lastmod>
```

## 网站地图的作用

1. **搜索引擎优化**：帮助搜索引擎更好地发现和索引您的网站页面
2. **提高收录速度**：搜索引擎可以更快地发现新页面
3. **优先级设置**：通过 `priority` 标签告诉搜索引擎页面的重要程度
4. **更新频率**：通过 `changefreq` 标签告诉搜索引擎页面更新频率

## 验证网站地图

1. 访问 `https://yourdomain.com/sitemap.xml` 确认文件可以正常访问
2. 在 Google Search Console 中提交网站地图
3. 在 Bing Webmaster Tools 中提交网站地图

## 文件结构
```
xiaofeng-ai/
├── index.html          # 主页面
├── sitemap.xml         # 网站地图
├── robots.txt          # 爬虫配置
├── style.css           # 样式文件
├── tetris.js           # 游戏脚本
└── SITEMAP_SETUP.md    # 配置说明
```

## 注意事项

- 确保网站地图文件可以通过 HTTP/HTTPS 访问
- 定期更新 `lastmod` 日期
- 当添加新页面时，记得更新网站地图
- 网站地图文件大小不应超过 50MB
- 单个网站地图不应包含超过 50,000 个 URL 