const CONDITION_SLUGS = {
    "新築・築浅": "new",
    "駅徒歩5分以内": "ekichika",
    オートロック: "autolock",
    宅配ボックス: "delivery",
    独立洗面台: "vanity",
    "バス・トイレ別": "bath",
    浴室乾燥機: "bath-dry",
    追い焚き機能: "reheating",
    温水洗浄便座: "bidet",
    室内洗濯機置場: "indoor-wash",
    エアコン: "ac",
    インターネット無料: "net",
    ペット相談: "pet",
    楽器相談: "instrument",
    角部屋: "corner",
    "2階以上": "upper-floor",
    デザイナーズ: "designers",
    分譲タイプ: "condo",
    低層マンション: "low-rise",
    タワーマンション: "tower",
    リノベーション: "renovation",
    新耐震基準: "seismic",
    管理体制良好: "management",
    バリアフリー: "barrier-free",
    システムキッチン: "kitchen",
    ガスコンロ: "gas-stove",
    IHコンロ: "ih",
    都市ガス: "city-gas",
    プロパンガス: "propane",
    床暖房: "floor-heating",
    ロフト付き: "loft",
    トランクルーム: "trunk",
    敷金ゼロ: "no-deposit",
    礼金ゼロ: "no-key-money",
    フリーレント: "free-rent",
    保証人不要: "no-guarantor",
    女性限定: "women-only",
    学生限定: "student-only",
    外国人相談可: "foreigner",
    "事務所・テレワーク可": "soho",
};

const getChipLabel = (chip) => chip.querySelector("span")?.textContent.trim() ?? "";

const getActiveChips = (chips) =>
    [...chips].filter((chip) => chip.classList.contains("is-active"));

/**
 * こだわり条件ページのチップ選択・クリア・検索遷移
 */
export const initializeConditionsChip = () => {
    const page = document.querySelector(".p-conditions-body");
    if (!page) return;

    const chips = page.querySelectorAll(".p-conditions-chip");
    const emptyMessage = page.querySelector(".js-conditions-empty");
    const selectedList = page.querySelector(".js-conditions-selected");
    const clearButtons = page.querySelectorAll(".js-conditions-clear");
    const searchButton = page.querySelector(".js-conditions-search");

    if (!chips.length) return;

    const updatePanel = () => {
        const activeChips = getActiveChips(chips);
        const hasSelection = activeChips.length > 0;

        if (emptyMessage) {
            emptyMessage.hidden = hasSelection;
        }

        if (selectedList) {
            selectedList.replaceChildren(
                ...activeChips.map((chip) => {
                    const item = document.createElement("li");
                    item.textContent = getChipLabel(chip);
                    return item;
                }),
            );
            selectedList.hidden = !hasSelection;
        }
    };

    const setChipActive = (chip, active) => {
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
    };

    const clearAll = () => {
        chips.forEach((chip) => setChipActive(chip, false));
        updatePanel();
    };

    const buildSearchUrl = () => {
        const params = new URLSearchParams();
        getActiveChips(chips).forEach((chip) => {
            const slug = chip.dataset.condition;
            if (slug) params.append("amenity", slug);
        });
        const query = params.toString();
        return query ? `search.html?${query}` : "search.html";
    };

    chips.forEach((chip) => {
        if (chip.dataset.chipReady === "true") return;
        chip.dataset.chipReady = "true";

        const label = getChipLabel(chip);
        if (CONDITION_SLUGS[label]) {
            chip.dataset.condition = CONDITION_SLUGS[label];
        }

        if (!chip.hasAttribute("aria-pressed")) {
            chip.setAttribute("aria-pressed", "false");
        }

        chip.addEventListener("click", () => {
            setChipActive(chip, !chip.classList.contains("is-active"));
            updatePanel();
        });
    });

    clearButtons.forEach((button) => {
        button.addEventListener("click", clearAll);
    });

    searchButton?.addEventListener("click", () => {
        window.location.href = buildSearchUrl();
    });

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.getAll("amenity").forEach((slug) => {
        chips.forEach((chip) => {
            if (chip.dataset.condition === slug) {
                setChipActive(chip, true);
            }
        });
    });

    updatePanel();
};
