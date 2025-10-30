import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Toast,
  ToastContainer,
} from "react-bootstrap";

export default function App() {
  const initialProducts = [
    { id: 1, name: "Makanan", description: "Produk makanan siap saji" },
    { id: 2, name: "Minuman", description: "Aneka minuman dingin & hangat" },
  ];

  // Ambil data dari localStorage saat pertama kali halaman dibuka
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Simpan ke localStorage setiap kali `products` berubah
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [price, setPrice] = useState(""); //simpan harga produk
  const [category, setCategory] = useState(""); //simpan kategori produk
  const [releaseDate, setReleaseDate] = useState(""); //simpan tanggal rilis produk
  const [stock, setStock] = useState(""); //simpan stok produk
  const [isActive, setIsActive] = useState(false); //simpan status aktif produk

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success"); // success | danger

  // Validasi input
  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    // Nama produk
    if (!trimmedName) newErrors.name = "Nama wajib diisi.";
    else if (trimmedName.length > 100)
      newErrors.name = "Maksimal 100 karakter.";

    // Deskripsi
    if (trimmedDescription.length < 20)
      newErrors.description = "Deskripsi minimal 20 karakter.";

    // Harga
    if (!price) newErrors.price = "Harga wajib diisi.";
    else if (isNaN(price) || price <= 0)
      newErrors.price = "Harga harus lebih dari 0.";

    // Kategori
    if (!category) newErrors.category = "Kategori wajib dipilih.";

    // Tanggal Rilis
    if (!releaseDate) newErrors.releaseDate = "Tanggal rilis wajib diisi.";
    else if (new Date(releaseDate) > new Date())
      newErrors.releaseDate = "Tanggal tidak boleh di masa depan.";

    // Stok
    if (stock < 0) newErrors.stock = "Stok tidak boleh negatif.";

    return newErrors;
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setReleaseDate("");
    setStock(0);
    setIsActive(false);
    setErrors({});
    setEditingId(null);
  };

  const showToastMsg = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Fungsi tambah & edit produk
  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);

    if (Object.keys(v).length !== 0) {
      showToastMsg("Periksa kembali input Anda.", "danger");
      return;
    }

    if (editingId === null) {
      // Tambah baru
      const newProduct = {
        id: Date.now(),
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        releaseDate,
        stock: Number(price),
        isActive,
      };

      setProducts((prev) => [...prev, newProduct]);
      resetForm();
      showToastMsg("Produk berhasil ditambahkan.", "success");
    } else {
      // Edit produk
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                category,
                releaseDate,
                stock: Number(stock),
                isActive,
              }
            : p
        )
      );
      resetForm();
      showToastMsg("Produk berhasil diperbarui.", "success");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setErrors({});
  };

  const handleDelete = (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const ok = window.confirm(`Hapus Produk "${target.name}"?`);
    if (!ok) return;

    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
    showToastMsg("Produk berhasil dihapus.", "success");
  };

  const descriptionCount = `${description.length}/200`;
  const isEditing = editingId !== null;
// Test
  return (
    <Container className="py-4">
      <Row>
        {/* === FORM === */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">
              {isEditing ? "Edit Produk" : "Tambah Produk"}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                {/* Nama Produk */}
                <Form.Group className="mb-3" controlId="productName">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Sembako"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    isInvalid={!!errors.name}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Deskripsi Produk */}
                <Form.Group className="mb-3" controlId="productDescription">
                  <Form.Label>Deskripsi (opsional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tulis deskripsi produk (maks. 200 karakter)"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description)
                        setErrors((prev) => ({
                          ...prev,
                          description: undefined,
                        }));
                    }}
                    isInvalid={!!errors.description}
                    maxLength={200}
                  />
                  <div className="d-flex justify-content-between">
                    <Form.Text muted>
                      Berikan deskripsi singkat produk.
                    </Form.Text>
                    <Form.Text muted>{descriptionCount}</Form.Text>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Harga Produk */}
                <Form.Group className="mb-3" controlId="productPrice">
                  <Form.Label>Harga Produk</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Masukkan harga produk"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    isInvalid={!!errors.price}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.price}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* kategori Produk */}
                <Form.Group className="mb-3" controlId="productCategory">
                  <Form.Label>Kategori Produk</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    isInvalid={!!errors.category}
                  >
                    <option value="">Pilih kategori</option>
                    <option value="makanan">Makanan</option>
                    <option value="minuman">Minuman</option>
                    <option value="elektronik">Elektronik</option>
                    <option value="pakaian">Pakaian</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Tanggal Rilis Produk */}
                <Form.Group className="mb-3" controlId="productReleaseDate">
                  <Form.Label>Tanggal Rilis Produk</Form.Label>
                  <Form.Control
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    isInvalid={!!errors.releaseDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.releaseDate}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Stok Produk */}
                <Form.Group className="mb-3" controlId="productStock">
                  <Form.Label>Stok Tersedia: {stock}</Form.Label>
                  <Form.Range
                    min={0}
                    max={500}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                  />
                  {errors.stock && (
                    <div className="text-danger small">{errors.stock}</div>
                  )}
                </Form.Group>

                {/* Status Aktif Produk */}
                <Form.Group className="mb-3" controlId="productIsActive">
                  <Form.Check
                    type="switch"
                    label="Produk Aktif"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                </Form.Group>

                {/* Tombol */}
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant={isEditing ? "primary" : "success"}
                  >
                    {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* === DAFTAR PRODUK === */}
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <Table
                  striped
                  bordered
                  hover
                  className="mb-0 align-middle"
                  style={{ minWidth: "1000px" }}
                >
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 90 }} className="text-center">
                        #
                      </th>
                      <th style={{ width: 150 }} className="text-center">
                        Nama
                      </th>
                      <th style={{ width: 250 }} className="text-center">
                        Deskripsi
                      </th>
                      <th style={{ width: 100 }} className="text-center">
                        Harga
                      </th>
                      <th style={{ width: 100 }} className="text-center">
                        Kategori
                      </th>
                      <th style={{ width: 190 }} className="text-center">
                        Tanggal Rilis
                      </th>
                      <th style={{ width: 80 }} className="text-center">
                        Stok
                      </th>
                      <th style={{ width: 80 }} className="text-center">
                        Status
                      </th>
                      <th style={{ width: 150 }} className="text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-muted">
                          Belum ada data produk.
                        </td>
                      </tr>
                    ) : (
                      products.map((product, idx) => (
                        <tr key={product.id}>
                          <td className="text-center">{idx + 1}</td>
                          <td className="text-center">{product.name}</td>
                          <td className="text-center">{product.description}</td>
                          <td className="text-center">
                            {product.price
                              ? new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                }).format(product.price)
                              : "-"}
                          </td>
                          <td className="text-center">{product.category}</td>
                          <td className="text-center">{product.releaseDate}</td>
                          <td className="text-center">{product.stock}</td>
                          <td className="text-center">
                            {product.isActive ? "Aktif" : "Tidak Aktif"}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() => handleEdit(product)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(product.id)}
                              >
                                Hapus
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === TOAST === */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === "danger" ? "text-white" : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
