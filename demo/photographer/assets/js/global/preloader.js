export const initializePreloader = () => {
  const el = document.getElementById("preloader");
  const num = document.getElementById("preloader-num");
  if (!el || !num) return { set() {}, done() {} };

  let currentTarget = 0; // 目標％（ロード進捗）
  let shown = 0;
  let raf;

  const loop = () => {
    shown += (currentTarget - shown) * 0.1; // 数字を滑らかに上げる
    num.textContent = Math.round(shown);
    if (Math.abs(currentTarget - shown) > 0.1) {
      raf = requestAnimationFrame(loop);
    }
  };

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    currentTarget = 100;
    num.textContent = "100";
    el.classList.add("is-done");
    document.body.classList.add("is-loaded"); // ★Hero文字割れの発火フック
  };

  // 保険：画像が無い/onLoadが来ない時も6秒で開幕
  const safety = setTimeout(finish, 6000);

  return {
    set(progress) {
      currentTarget = Math.min(100, Math.round(progress * 100));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    },
    done() {
      clearTimeout(safety);
      finish();
    },
  };
};
