from locust import HttpUser, task, between
import random

class MarketplaceUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Регистрируемся при старте
        self.client.post("/api/register/", {
            "username": f"user_{random.randint(1, 10000)}",
            "email": f"user{random.randint(1, 10000)}@example.com",
            "password": "testpass123",
            "role": "buyer"
        })
    
    @task(3)
    def view_products(self):
        self.client.get("/api/products/")
    
    @task(2)
    def view_categories(self):
        self.client.get("/api/categories/")
    
    @task(1)
    def search_products(self):
        self.client.get("/api/products/?search=картошка")