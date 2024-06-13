// 数据逻辑

/**
 * 构造一个新的商品对象，以避免修改原始数据
 */
class UIGoods {
  constructor(good) {
    this.data = good;
    this.choose = 0;
  }

  // 获取总价
  getTotalPrice() {
    return this.data.price * this.choose;
  }

  // 是否选中
  isChoosed() {
    return this.choose > 0;
  }

  increase() {
    this.choose++;
  }

  decrease() {
    if (this.choose > 0) {
      this.choose--;
    }
  }
}

/**
 * 构造一个购物车对象，用以存储整体的信息
 */
class UITrolley {
  constructor(deliveryThreshold, deliveryFee) {
    this.deliveryThreshold = deliveryThreshold;
    this.deliveryFee = deliveryFee;

    this.data = goods.map((g) => {
      return new UIGoods(g);
    });
  }

  getTotalPrice() {
    return this.data.reduce((totalPrice, currentUIGood) => {
      totalPrice += currentUIGood.getTotalPrice();
      return totalPrice;
    }, 0);
  }

  // 增加某件商品的数量
  increase(index) {
    this.data[index].increase();
  }
  decrease(index) {
    this.data[index].decrease();
  }

  // 共选中了几件商品
  getTotalGoodsNumber() {
    return this.data.reduce(
      (totalGoodsNumber, currentUIGood) =>
        totalGoodsNumber + currentUIGood.choose,
      0
    );
  }

  // 购物车是否为空
  hasGoodsinTrolley() {
    return this.getTotalGoodsNumber() > 0;
  }

  // 是否达到起送门槛
  isBeyondThreshold() {
    return this.getTotalPrice() >= this.deliveryThreshold;
  }

  isChoosed(index) {
    return this.data[index].isChoosed();
  }

  getChoosed(index) {
    return this.data[index].choose;
  }
}

// 界面逻辑
class UI {
  constructor() {
    this.data = new UITrolley(30, 5);
    this.doms = {
      goodsContainer: document.querySelector(".goods-list"),
      deliveryFee: document.querySelector(".footer-car-tip"),
      footerPay: document.querySelector(".footer-pay"),
      deliveryThreshold: document.querySelector(".footer-pay span"),
      totalPrice: document.querySelector(".footer-car-total"),
      trolley: document.querySelector(".footer-car"),
      badge: document.querySelector(".footer-car-badge"),
    };
    this.createGoodsContainer();
    this.updateTrolley();
    this.listenEvents();
    this.jumpDestination = this.getJumpDestination();
  }

  // 根据商品数据创建商品列表
  createGoodsContainer() {
    // 利用模板字符串快速开发，如果后续遇到执行效率问题，再优化
    let innerHTMLContent = "";
    this.data.data.forEach((uig, i) => {
      innerHTMLContent += `<div class="goods-item">
          <img src="${uig.data.pic}" alt="" class="goods-pic" />
          <div class="goods-info">
            <h2 class="goods-title">${uig.data.title}</h2>
            <p class="goods-desc">
              ${uig.data.desc}
            </p>
            <p class="goods-sell">
              <span>月售 ${uig.data.sellNumber}</span>
              <span>好评率${uig.data.favorRate}%</span>
            </p>
            <div class="goods-confirm">
              <p class="goods-price">
                <span class="goods-price-unit">￥</span>
                <span>${uig.data.price}</span>
              </p>
              <div class="goods-btns">
                <i index="${i}" class="iconfont i-jianhao"></i>
                <span>${uig.choose}</span>
                <i index="${i}" class="iconfont i-jiajianzujianjiahao"></i>
              </div>
            </div>
          </div>
        </div>`;
    });
    this.doms.goodsContainer.innerHTML = innerHTMLContent;
  }

  increase(index) {
    this.data.increase(index);
    this.updateGoodsItem(index);
    this.updateTrolley();
    this.addAnimateJump(index);
  }
  decrease(index) {
    this.data.decrease(index);
    this.updateGoodsItem(index);
    this.updateTrolley();
    this.trolleyAnimate();
  }

  // 更新某个商品的显示状态
  updateGoodsItem(index) {
    const goodsDOM = this.doms.goodsContainer.children[index];
    this.data.isChoosed(index)
      ? goodsDOM.classList.add("active")
      : goodsDOM.classList.remove("active");
    const span = goodsDOM.querySelector(".goods-btns span");
    span.textContent = this.data.getChoosed(index);
  }

  // 更新购物车
  updateTrolley() {
    // get totalPrice
    const totalPrice = this.data.getTotalPrice();
    // set totalPrice
    this.doms.totalPrice.textContent = totalPrice.toFixed(2);
    // set delivery fee
    this.doms.deliveryFee.textContent = `配送费￥${this.data.deliveryFee}`;
    // set delivery threshold
    if (this.data.isBeyondThreshold()) {
      this.doms.footerPay.classList.add("active");
    } else {
      this.doms.footerPay.classList.remove("active");
      this.doms.deliveryThreshold.textContent = `还差￥${Math.round(
        this.data.deliveryThreshold - totalPrice
      )}元起送`;
    }

    // set trolley status
    if (this.data.hasGoodsinTrolley()) {
      this.doms.trolley.classList.add("active");
      this.doms.badge.textContent = this.data.getTotalGoodsNumber();
    } else {
      this.doms.trolley.classList.remove("active");
    }
  }

    /*
        购物车动画
        多次点击会覆盖之前的效果，更符合预期
    */
  trolleyAnimate() {
    this.doms.trolley.classList.remove("animate");
    this.doms.trolley.clientHeight; // 强制渲染
    this.doms.trolley.classList.add("animate");
  }

  // 计算jump动画终点
  getJumpDestination() {
    const trolleyRect = this.doms.trolley.getBoundingClientRect();
    return {
      x: trolleyRect.left + trolleyRect.width / 2,
      y: trolleyRect.top + trolleyRect.height / 5,
    };
  }

  // 添加动画 抛物线跳跃
  addAnimateJump(index) {
    // jump起点
    const btnDOM = this.doms.goodsContainer.children[index].querySelector(
      ".i-jiajianzujianjiahao"
    );
    const btnRect = btnDOM.getBoundingClientRect();
    const jumpStartPoint = {
      x: btnRect.left,
      y: btnRect.top,
    };

    // 创建jump元素
    const div = document.createElement("div");
    div.className = "add-to-car";
    const i = document.createElement("i");
    i.className = "iconfont i-jiajianzujianjiahao";
    // 设置初始位置
    div.style.transform = `translateX(${jumpStartPoint.x}px)`;
    i.style.transform = `translatey(${jumpStartPoint.y}px)`;
    div.appendChild(i);
    document.body.appendChild(div);
    // 强行渲染
    div.clientHeight; // 触发reflow导致强行渲染
    // 设置结束位置
    div.style.transform = `translateX(${this.jumpDestination.x}px)`;
    i.style.transform = `translatey(${this.jumpDestination.y}px)`;

    const that = this;
    div.addEventListener(
      "transitionend",
      function () {
        div.remove();
        that.trolleyAnimate();
      },
      {
        once: true, // 事件仅触发一次
      }
    );
  }

  // 监听各种事件
  listenEvents() {
    // this.doms.trolley.addEventListener("animationend", function () {
    //   // 这里的this指向被添加listener的元素
    //   this.classList.remove("animate");
    // });
    this.doms.goodsContainer.addEventListener("click", function (e) {
      if (e.target.classList.contains("i-jiajianzujianjiahao")) {
        ui.increase(+e.target.getAttribute("index"));
      }
      if (e.target.classList.contains("i-jianhao")) {
        ui.decrease(+e.target.getAttribute("index"));
      }
    });
  }
}

// init
const ui = new UI();
