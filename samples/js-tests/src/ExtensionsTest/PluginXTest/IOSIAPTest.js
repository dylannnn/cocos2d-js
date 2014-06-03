/****************************************************************************
 Copyright (c) 2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

TAG_SETSERVERMODE = 0;
TAG_GETPRODUCTLIST = 1;
TAG_PAYMENT = 2;
TAG_TOAST = 3;

TAG_SETSERVERMODE_RESULT = 4;
TAG_GETPRODUCTLIST_RESULT = 5;
TAG_PAYMENT_RESULT = 6;

var s_IAPFunctionItem = [
    {name: "setServerMode", tag: TAG_SETSERVERMODE},
    {name: "getProductList", tag: TAG_GETPRODUCTLIST},
    {name: "PayForProduct", tag: TAG_PAYMENT}
];
var s_IAPResultItem = [
    {name: "false", tag: TAG_SETSERVERMODE_RESULT},
    {name: "[ ]", tag: TAG_GETPRODUCTLIST_RESULT},
    {name: "didn't call payFunction yet", tag: TAG_PAYMENT_RESULT}
];
var IAPTestLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },
    onEnter: function () {
        this._super();
        this.addCloseBtn();
        this.initPlugin();
        this.addMenuItem();
        this.initToast();
    },
    initPlugin: function () {
        var pluginManager = plugin.PluginManager.getInstance();
        this.PluginIAP = pluginManager.loadPlugin("IOSIAP");
        this.PluginIAP.setResultListener(this);
    },
    addMenuItem: function () {
        var payMenu = cc.Menu.create();
        for (var i = 0; i < s_IAPFunctionItem.length; i++) {
            var text = cc.LabelTTF.create(s_IAPFunctionItem[i].name, "Arial", 20);
            var item = cc.MenuItemLabel.create(text, this.menuCallBack, this);
            item.tag = s_IAPFunctionItem[i].tag;
            item.x = 200;
            item.y = cc.winSize.height - 200 - i * 50;

            var resultLabel = cc.LabelTTF.create(s_IAPResultItem[i].name, "Arial", 20);
            resultLabel.color = cc.color(125, 125, 125);
            resultLabel.anchorX = 0;
            resultLabel.tag = s_IAPResultItem[i].tag;
            resultLabel.x = 300;
            resultLabel.y = cc.winSize.height - 200 - i * 50;
            payMenu.addChild(item);
            this.addChild(resultLabel);
        }
        payMenu.x = 0;
        payMenu.y = 0;
        this.addChild(payMenu);
    },
    addCloseBtn: function () {
        var pCloseItem = cc.MenuItemImage.create(
            "CloseNormal.png",
            "CloseSelected.png",
            this.closeFunction,
            this);
        pCloseItem.setPosition(cc.p(cc.winSize.width - 20, 20));

        // create menu, it's an autorelease object
        var pMenu = cc.Menu.create(pCloseItem);
        pMenu.setPosition(cc.p(0, 0));
        this.addChild(pMenu, 1);
    },
    closeFunction:function(sender){
        var scene = new ExtensionsTestScene();
        scene.runThisTest();
        cc.director.runScene(scene);
    },
    initToast: function () {
        this.toastLayer = cc.LayerColor.create();
        var label = cc.LabelTTF.create("loading", "Arial", 16);
        this.toastLayer.addChild(label);
        this.toastLayer.setTag(TAG_TOAST);
        label.x = cc.winSize.width / 2;
        label.y = cc.winSize.height / 2;
        this.toastLayer.retain();
        this.toastLayer.setColor(cc.color(100, 100, 100, 100));
    },
    toggleToast: function (show) {
        if (show) {
            if (!this.getChildByTag(TAG_TOAST)) {
                this.addChild(this.toastLayer);
            }
        } else {
            this.toastLayer.removeFromParent(true);
        }
    },
    menuCallBack: function (sender) {
        this.toggleToast(true);
        if (sender.tag === TAG_SETSERVERMODE) {
            this.PluginIAP.callFuncWithParam("setServerMode");
            var label = this.getChildByTag(TAG_SETSERVERMODE_RESULT);
            if (label) {
                label.setString("true");
                this.toggleToast(false);
            }
        } else if (sender.tag == TAG_GETPRODUCTLIST) {
            //replace these ids to your own productIdentifiers
            var pidList = ["001", "002"];
            this.PluginIAP.callFuncWithParam("requestProducts", plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, pidList.toString()));
        }else if(sender.tag  == TAG_PAYMENT){
            if(!this.product){
                var label = this.getChildByTag(TAG_PAYMENT_RESULT);
                if (label) {
                    label.setString("please call requestProducts first");
                    this.toggleToast(false);
                    return;
                }
            }
            this.PluginIAP.payForProduct(this.product[0]);
        }
    },

    onPayResult: function (ret, msg, productInfo) {
        this.toggleToast(false);
        cc.log("onPayResult productInfo is "+productInfo.productId);
        var str = "";
        if (ret == 0) {
            str = "payment Success pid is "+productInfo.productId;
        }else if(ret == 4){
            str = "payment verify from server";
            this.postServerData(msg);
        }else if(ret == 1){
            str == "";
        }
        var label = this.getChildByTag(TAG_PAYMENT_RESULT);
        if (label) {
            label.setString(str);
        }
    },
    onRequestProductResult: function (ret, productInfo) {
        var msgStr = "";
        if (ret == 0) {
            msgStr = "request error";
            this.toggleToast(false);
        } else if (ret == 1) {
            cc.log("request RequestSuccees "+productInfo[0].productName);
            this.product = productInfo;
            msgStr = "list: [";
            for (var i = 0;i<productInfo.length;i++) {
                var product = productInfo[i];
                cc.log(product.productId)
                msgStr += product.productName + " ";
            }
            msgStr += " ]";
            this.toggleToast(false);
        } else if (ret == 2) {
            msgStr = "request RequestSending";
        }
        var label = this.getChildByTag(TAG_GETPRODUCTLIST_RESULT);
        if (label) {
            label.setString(msgStr);
        }
    },
    postServerData: function (data) {
        var that = this;
        var xhr = cc.loader.getXMLHttpRequest();
        //replace to your own server address
        xhr.open("POST", "http://192.168.52.37:8888/start");
        that.toggleToast(true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                that.toggleToast(false);
                var result = JSON.parse(xhr.responseText);
                that.PluginIAP.callFuncWithParam("finishTransaction", new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, result.receipt.in_app[0].product_id));
            }
        };
        // you can add your data and post them to your server;
        var result = {userid: 100, receipt: data};
        xhr.send(JSON.stringify(result));
    },
    onExit: function () {
        this._super();
        this.toastLayer.release();
    }
});

var IOSIAPTest = cc.Scene.extend({
    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Scene);
    },

    onEnter: function () {
        this._super();
        var layer = new IAPTestLayer();
        this.addChild(layer);
    }
});