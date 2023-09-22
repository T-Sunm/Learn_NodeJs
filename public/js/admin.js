const deleteProduct = (btn) => {
    // parentNode là thẻ cha bọc ngoài phần tử đang chọn
    // .querySelector('[name=productId]'): Phương thức này tìm kiếm phần tử con đầu tiên của phần tử cha,
    // có thuộc tính name bằng "productId".
    const prodId = btn.parentNode.querySelector('[name=productId]').value
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value

    // Phương thức closest tìm phần tử gần nhất có tag là "article" tính từ btn (nút "delete").
    // Điều này đảm bảo rằng chúng ta đang thao tác với sản phẩm đúng mà nút "delete" được nhấn.
    const productElement = btn.closest('article')

    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(result => {
            return result.json()
        })
        .then(data => {
            console.log(data)
            // vì khi nhấn xóa thì view client phải nhấn load mới update được
            // nên thêm lệnh xóa Node ở view để tăng trải nghiệm

            productElement.parentNode.removeChild(productElement)
        })
        .catch(err => {
            console.log(err)
        })
}