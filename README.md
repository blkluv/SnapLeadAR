# SnapLead AR: Snap Camera Kit Web SDK Lenses and Filters 📸

<p align="center">
  <img src="https://github.com/Takk8IS/SnapLeadAR/blob/main/public/favicon.svg?raw=true" alt="SnapLead AR Snap Camera Kit Web SDK" width="300">
</p>

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/Takk8IS/SnapLeadAR)
[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![GitHub issues](https://img.shields.io/github/issues/Takk8IS/SnapLeadAR.svg)](https://github.com/Takk8IS/SnapLeadAR/issues)
[![GitHub stars](https://img.shields.io/github/stars/Takk8IS/SnapLeadAR.svg)](https://github.com/Takk8IS/SnapLeadAR/stargazers)

## 🌟 Features of SnapLead AR Snap Camera Kit Web SDK

SnapLead AR combines engaging Snap Camera Kit Web SDK effects with lead collection functionality. Users enter their information into a custom form to access AR filters, record their experience, and even share their videos.

## 🚀 Key Features

-   ✨ **Interactive AR Effects**: Access Snapchat filters directly from your web browser.
-   🎯 **Lead Capture Form**: Users enter details (name, email, favorite color) to access AR features.
-   🎥 **Video Recording**: Users can record and download a 30-second video using AR effects.
-   📤 **Easy Sharing**: Videos can be downloaded or shared on social platforms like Instagram, Snapchat, or WhatsApp.

## 📦 Project Structure

```
SnapLeadAR
├── AUTHORS.md
├── FUNDING.yml
├── LICENSE.md
├── README.md
├── jsdoc.config.js
├── package.json
├── public
│   ├── favicon.svg
│   └── index.html
├── server
│   └── server.js
├── src
│   ├── App.css
│   ├── App.js
│   ├── components
│   │   ├── FeedbackMessages
│   │   │   ├── FeedbackMessage.css
│   │   │   └── FeedbackMessage.js
│   │   ├── LeadCaptureForm
│   │   │   ├── LeadCaptureForm.css
│   │   │   └── LeadCaptureForm.jsx
│   │   └── LoadingModal
│   │   ├── LoadingModal.css
│   │   └── LoadingModal.jsx
│   ├── context
│   │   └── AppContext.js
│   ├── i18n.js
│   ├── index.css
│   ├── index.js
│   ├── pages
│   │   └── SnapCamera
│   │   ├── SnapCamera.css
│   │   └── SnapCamera.jsx
│   ├── services
│   │   ├── analyticsService.js
│   │   └── apiService.js
│   ├── tests
│   │   ├── LeadCaptureForm.test.js
│   │   ├── pages
│   │   │   └── SnapCamera.test.js
│   │   └── services
│   │   ├── apiService.test.js
│   │   └── googleSheets.test.js
│   ├── types
│   │   └── index.js
│   └── utils
│   ├── errorHandling.js
│   ├── formUtils.js
│   └── googleSheets.js
├── vercel.json
└── webpack.config.js
```

## 💾 How to Use

1. **Fill out the form**: Users enter their name, email, and favorite color.
2. **Access AR filters**: After submitting the form, users gain access to Snapchat AR filters.
3. **Record videos**: Capture up to 30 seconds of AR-enhanced video.
4. **Download and share**: Download the video or share it on social media platforms.

## 🔧 Installation & Setup

1. **Clone the Repository**:

```bash
git clone https://github.com/Takk8IS/SnapLeadAR.git
```

2. **Install Dependencies**:

```bash
cd SnapLeadAR
npm i
```

3. **Set Up Environment Variables**: Configure your `.env` file with:

```
# Server URL
SERVER_URL="http://localhost/snapleadar/"
# Server Port
PORT="8016"

# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account-email@project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
# Google Spreadsheet IDs
SPREADSHEET_ID="your-google-spreadsheet-id"

# Snap Camera Kit
REACT_APP_LENS_GROUP_ID="your-lens-group-id"
REACT_APP_API_TOKEN="your-api-token"
REACT_APP_LENS_IDS="your-lens-ids-separated-by-comma"

# Vercel URL
VERCEL_URL="https://your-vercel-url.vercel.app"
```

4. **Build the Application**:

```bash
npm run build
```

5. **Run the Application**:

```bash
npm run dev
```

6. **Deploy on Vercel**:

First, ensure you have the Vercel CLI installed globally:

```bash
sudo npm i -g vercel
```

Then, initialize the deployment process:

```bash
vercel
```

Finally, deploy to production:

```bash
vercel --prod
```

## 🔒 Privacy & Compliance

SnapLead AR Snap Camera Kit Web SDK respects user privacy, ensuring data is used solely for intended lead capture purposes and stored securely.

## 💡 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 🤝 Donations

If this project has been helpful, consider making a donation:

**USDT (TRC-20)**: `TGpiWetnYK2VQpxNGPR27D9vfM6Mei5vNA`

Your support helps us continue to develop innovative tools.

## 📜 Licence

This project is licensed under the CC-BY-4.0 Licence. See the [LICENSE](LICENSE.md) file for more details.

## 🧠 About Takk™ Innovate Studio

Leading the Digital Revolution as the Pioneering 100% Artificial Intelligence Team.

-   Author: [David C Cavalcante](mailto:davcavalcante@proton.me)
-   Author Co-Name: [Fjallstoppur](mailto:fjallstoppur@proton.me)
-   LinkedIn: [linkedin.com/in/hellodav](https://www.linkedin.com/in/hellodav/)
-   Email: [Takk™ Innovate Studio](mailto:say@takk.ag)
-   X: [@Takk8IS](https://twitter.com/takk8is/)
-   Medium: [takk8is.medium.com](https://takk8is.medium.com/)
-   Website: [takk.ag](https://takk.ag/)
