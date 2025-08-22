# Video SDK Web Video-Processor Quickstart

Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

The [Zoom Video SDK for web](https://developers.zoom.us/docs/video-sdk/web/) enables you to build custom video experiences on a webpage with Zoom's core technology. This demo showcases how to use a [media processor](https://developers.zoom.us/docs/video-sdk/web/raw-data) to add a watermark to the video stream:

![](images/screencap.png)

## Installation

To get started, clone the repo:

`git clone https://github.com/zoom/videosdk-web-videoprocessor-quickstart`

## Setup

1. Install the dependencies:

   `npm install`

1. Create a `.env` file in the root directory of the project, you can do this by copying the `.env.example` file (`cp .env.example .env`) and replacing the values with your own. The `.env` file should look like this, with your own Zoom Video SDK key and secret:

   ```
   VITE_SDK_KEY=abc123XXXXXXXXXX
   VITE_SDK_SECRET=abc123XXXXXXXXXX
   ```

   Add your Zoom Video SDK key and secret to the `.env` file.

1. Run the app:

   `npm run dev`

## Usage

1. Navigate to http://localhost:5173

1. Click "Join" to join the session

1. The rendered video will have a watermark

For the full list of features and event listeners, as well as additional guides, see our [Video SDK docs](https://developers.zoom.us/docs/video-sdk/web/).

You can find a more example in the [advanced branch](https://github.com/zoom/videosdk-web-videoprocessor-quickstart/tree/advanced):
![](images/card.png)

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://explore.zoom.us/docs/en-us/developer-support-plans.html) plans.

## Disclaimer

Do not expose your credentials to the client, when using the Video SDK in production please make sure to use a backend service to sign the tokens. Don't store credentials in plain text, as this is a sample app we're using an `.env` for sake of simplicity.
