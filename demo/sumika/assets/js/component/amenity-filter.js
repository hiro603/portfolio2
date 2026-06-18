/**
 * こだわり条件で物件を絞り込み（複数選択=AND）
 */
export const initializeAmenityFilter = () => {
  const chips = document.querySelectorAll(".js-amenity");
  const properties = document.querySelectorAll(".js-property");
  const emptyMessage = document.querySelector(".js-property-empty");

  if (!chips.length || !properties.length) return;

  const applyFilter = () => {
    const active = [...chips]
      .filter((chip) => chip.classList.contains("is-active"))
      .map((chip) => chip.dataset.amenity);

    let visible = 0;
    properties.forEach((property) => {
      const owned = (property.dataset.amenities || "").split(" ");
      const match = active.every((amenity) => owned.includes(amenity));
      property.classList.toggle("is-hidden", !match);
      if (match) visible += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visible !== 0;
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const next = !chip.classList.contains("is-active");
      chip.classList.toggle("is-active", next);
      chip.setAttribute("aria-pressed", String(next));
      applyFilter();
    });
  });
};
