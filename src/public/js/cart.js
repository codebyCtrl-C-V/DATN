document.addEventListener("DOMContentLoaded", function () {
    const toastElement = document.getElementById("cartToast");
    const toast = toastElement ? new bootstrap.Toast(toastElement, { delay: 3000 }) : null;
  
    document.querySelectorAll(".add-cart").forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const productId = this.dataset.productId;
        const input = this.closest(".product-item").querySelector("#quantity");
        const quantity = parseInt(input?.value || 1);
  
        try {
          const res = await fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          });
  
          const data = await res.json();
          if (res.ok) {
            toast?.show();
          } else {
            alert(data.message || "Lỗi không xác định");
          }
        } catch (error) {
          console.error("Lỗi khi thêm giỏ hàng:", error);
          alert("Không thể thêm sản phẩm vào giỏ hàng.");
        }
      });
    });
  });
  