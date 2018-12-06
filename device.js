/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = [
  {
    'name': 'Chrome',
    'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36',
    'viewport': {
      'width': 1920,
      'height': 1080,
      'mobile': false
    },
    'isTouch': true
  },
  {
    'name': 'iPad Pro',
    'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    'viewport': {
      'width': 1024,
      'height': 1366,
      'deviceScaleFactor': 1,
      'mobile': true
    },
    'isTouch': true
  },
  {
    'name': 'iPad landscape',
    'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    'viewport': {
      'width': 1024,
      'height': 768,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPad Mini',
    'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    'viewport': {
      'width': 768,
      'height': 1024,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true
  },
  {
    'name': 'iPad Mini landscape',
    'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    'viewport': {
      'width': 1024,
      'height': 768,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPad Pro landscape',
    'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    'viewport': {
      'width': 1366,
      'height': 1024,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone 4',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
    'viewport': {
      'width': 320,
      'height': 480,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 4 landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
    'viewport': {
      'width': 480,
      'height': 320,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone 5',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    'viewport': {
      'width': 320,
      'height': 568,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 5 landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    'viewport': {
      'width': 568,
      'height': 320,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone 6',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 375,
      'height': 667,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 6 landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 667,
      'height': 375,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 6 Plus',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 414,
      'height': 736,
      'deviceScaleFactor': 3,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone 6 Plus landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 736,
      'height': 414,
      'deviceScaleFactor': 3,
      'mobile': true,
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 7',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 375,
      'height': 667,
      'deviceScaleFactor': 2,
      'mobile': true,
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 7 landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 667,
      'height': 375,
      'deviceScaleFactor': 2,
      'mobile': true,
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 7 Plus',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 414,
      'height': 736,
      'deviceScaleFactor': 3,
      'mobile': true,
    },
    'isTouch': true
  },
  {
    'name': 'iPhone 7 Plus landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 736,
      'height': 414,
      'deviceScaleFactor': 3,
      'mobile': true,
      'isTouch': true,
    }
  },
  {
    'name': 'iPhone 8',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 375,
      'height': 667,
      'deviceScaleFactor': 2,
      'mobile': true,
      'isTouch': true,
    }
  },
  {
    'name': 'iPhone 8 landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 667,
      'height': 375,
      'deviceScaleFactor': 2,
      'mobile': true,
      'isTouch': true,
    }
  },
  {
    'name': 'iPhone 8 Plus',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 414,
      'height': 736,
      'deviceScaleFactor': 3,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone 8 Plus landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 736,
      'height': 414,
      'deviceScaleFactor': 3,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone SE',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    'viewport': {
      'width': 320,
      'height': 568,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone SE landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    'viewport': {
      'width': 568,
      'height': 320,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone X',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 375,
      'height': 812,
      'deviceScaleFactor': 3,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'iPhone X landscape',
    'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'viewport': {
      'width': 812,
      'height': 375,
      'deviceScaleFactor': 3,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 10',
    'userAgent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Safari/537.36',
    'viewport': {
      'width': 800,
      'height': 1280,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 10 landscape',
    'userAgent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Safari/537.36',
    'viewport': {
      'width': 1280,
      'height': 800,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 4',
    'userAgent': 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 384,
      'height': 640,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 4 landscape',
    'userAgent': 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 640,
      'height': 384,
      'deviceScaleFactor': 2,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 5',
    'userAgent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 360,
      'height': 640,
      'deviceScaleFactor': 3,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 5 landscape',
    'userAgent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 640,
      'height': 360,
      'deviceScaleFactor': 3,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 5X',
    'userAgent': 'Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR4.170623.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 412,
      'height': 732,
      'deviceScaleFactor': 2.625,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 5X landscape',
    'userAgent': 'Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR4.170623.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 732,
      'height': 412,
      'deviceScaleFactor': 2.625,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 6',
    'userAgent': 'Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 412,
      'height': 732,
      'deviceScaleFactor': 3.5,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 6 landscape',
    'userAgent': 'Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 732,
      'height': 412,
      'deviceScaleFactor': 3.5,
      'mobile': true
    },
    'isTouch': true,
  },
  {
    'name': 'Nexus 6P',
    'userAgent': 'Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3452.0 Mobile Safari/537.36',
    'viewport': {
      'width': 412,
      'height': 732,
      'deviceScaleFactor': 3.5,
      'mobile': true
    },
    'isTouch': true,
  },
];

for (const device of module.exports)
  module.exports[device.name] = device;
