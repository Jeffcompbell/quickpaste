# 激活码验证 API 使用说明

## 基本信息

AppID：app_fEFqY0K9jA

AppSecret：6kzTbFMiv57VpWL3SLY8ZDuybO4zwfur

## 验证激活码

Endpoint

POST https://activecode.vercel.app/api/codes/validate

Headers

{
"Content-Type": "application/json"
}
Request Body

{
"code": "XXXX-XXXX-XXXX-XXXX",
"deviceId": "DESKTOP-A1B2C3D4",
"deviceName": "John's MacBook Pro",
"os": "macOS 13.0",
"ip": "192.168.1.100",
"mac": "00:11:22:33:44:55",
"metadata": {
"appVersion": "1.0.0",
"language": "zh-CN",
"screenResolution": "1920x1080"
},
"productId": "cm5fc2uz10000md03w8u1f2pd"
}
Responses

{
"200": {
"message": "激活成功",
"data": {
"activation": "激活记录",
"device": "设备信息"
}
},
"400": {
"message": "错误信息",
"cases": [
"激活码已过期",
"激活码已达到最大设备数限制",
"设备已激活此产品"
]
},
"404": {
"message": "激活码无效"
},
"500": {
"message": "激活失败"
}
}
示例代码
// 1. 收集设备信息
const deviceInfo = {
code: "YOUR-ACTIVATION-CODE", // 用户输入的激活码
deviceId: await getDeviceId(), // 获取或生成设备唯一标识
deviceName: os.hostname(), // 获取设备名称
os: `${os.platform()} ${os.release()}`, // 获取操作系统信息
ip: await getIpAddress(), // 获取IP地址
mac: await getMacAddress(), // 获取MAC地址（可选）
metadata: { // 其他信息（可选）
appVersion: "1.0.0",
language: navigator.language,
screenResolution: `${screen.width}x${screen.height}`
},
productId: "cm5fc2uz10000md03w8u1f2pd" // 你的产品ID
};

// 2. 发送激活请求
const response = await fetch('https://activecode-2f0npbh81-linshus-projects.vercel.app/api/codes/validate', {
method: 'POST',
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(deviceInfo)
});

// 3. 处理响应
const result = await response.json();
if (response.ok) {
// 激活成功
console.log("激活成功:", result.data);
// 保存激活状态到本地
localStorage.setItem('activation_status', 'activated');
} else {
// 激活失败
console.error("激活失败:", result.message);
// 处理错误情况
switch (response.status) {
case 400:
// 处理验证错误（过期、达到限制等）
break;
case 404:
// 处理无效激活码
break;
case 500:
// 处理服务器错误
break;
}
}
