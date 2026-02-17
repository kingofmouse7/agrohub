import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('cart/add/', { product_id: productId, quantity: 1 });
      alert('Товар добавлен в корзину');
    } catch (error) {
      alert('Ошибка при добавлении в корзину');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <Container>
      <h1 className="my-4">Товары</h1>
      <Row>
        {products.map(product => (
          <Col key={product.id} md={4} className="mb-4">
            <Card>
              {product.image && (
                <Card.Img variant="top" src={`http://127.0.0.1:8000${product.image}`} />
              )}
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description.substring(0, 100)}...</Card.Text>
                <Card.Text>
                  <strong>Цена:</strong> {product.price} ₽/{product.unit}
                </Card.Text>
                <Button 
                  variant="primary" 
                  onClick={() => addToCart(product.id)}
                >
                  В корзину
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Products;