'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Book {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Author {
  id: string;
  name: string;
  birthDate: string;
}

interface OrderBook {
  skuCode: string;
  name: string;
  price: number;
  inStock: boolean;
}

const API_BASE_URL = '/api';
const AUTHORS_ENDPOINT = '/api/authors';
const GRAPHQL_ENDPOINT = '/api/graphql';

const HOST_FALLBACK = typeof window !== 'undefined'
  ? window.location.hostname
  : 'localhost';

const urls = {
  eureka: `http://${HOST_FALLBACK}:8761/`,
  zipkin: `http://${HOST_FALLBACK}:9411/zipkin/`,
  prometheus: `http://${HOST_FALLBACK}:9090/`,
  grafana: `http://${HOST_FALLBACK}:3001/`,
};

const availableBooks: OrderBook[] = [
  { skuCode: 'design_patterns_gof', name: 'Design Patterns', price: 29, inStock: true },
  { skuCode: 'mythical_man_month', name: 'Mythical Man Month', price: 39, inStock: false },
];

const Home = () => {
  const [booksLoading, setBooksLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState<Book>({
    id: '',
    name: '',
    description: '',
    price: 0
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [newAuthor, setNewAuthor] = useState<Author>({
    id: '',
    name: '',
    birthDate: ''
  });
  const [orderStatus, setOrderStatus] = useState('');
  const [selectedBook, setSelectedBook] = useState<OrderBook>(availableBooks[0]);
  const [validationError, setValidationError] = useState('');

  const orderSectionRef = useRef<HTMLDivElement>(null);

  const fetchBooks = async () => {
    try {
      setBooksLoading(true);
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'query { getAllBooks { id name description price } }'
        })
      });
      const data = await response.json();
      if (data.data && data.data.getAllBooks) {
        setBooks(data.data.getAllBooks);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  const handleAddBook = async () => {
    const { name, description, price } = newBook;
    if (!name || !description || price <= 0) {
      setValidationError('All fields are required and price must be greater than zero.');
      return;
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'mutation CreateBook($bookRequest: BookRequest!) { createBook(bookRequest: $bookRequest) { id name description price } }',
          variables: { bookRequest: { name, description, price } }
        })
      });
      const data = await response.json();
      if (data.data) {
        await fetchBooks();
        setNewBook({ id: '', name: '', description: '', price: 0 });
        setValidationError('');
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'mutation DeleteBook($id: ID!) { deleteBook(id: $id) }',
          variables: { id }
        })
      });
      const data = await response.json();
      if (data.data) {
        await fetchBooks();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (orderStatus) {
      const timer = setTimeout(() => setOrderStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [orderStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
    setValidationError('');
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get(AUTHORS_ENDPOINT);
      setAuthors(response.data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const addAuthor = async () => {
    if (!newAuthor.name || !newAuthor.birthDate) {
      console.error('All fields are required.');
      return;
    }

    try {
      await axios.post(AUTHORS_ENDPOINT, newAuthor);
      await fetchAuthors();
      setNewAuthor({ id: '', name: '', birthDate: '' });
    } catch (error) {
      console.error('Error adding author:', error);
    }
  };

  const deleteAuthor = async (id: string) => {
    try {
      await axios.delete(`${AUTHORS_ENDPOINT}/${id}`);
      await fetchAuthors();
    } catch (error) {
      console.error('Error deleting author:', error);
    }
  };

  const placeOrder = async () => {
    const order = {
      orderLineItemsDtoList: [
        {
          skuCode: selectedBook.skuCode,
          price: selectedBook.price,
          quantity: 1
        }
      ]
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/order`, order, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status === 'success') {
        setOrderStatus(response.data.message);
      } else {
        setOrderStatus(response.data.message || 'Failed to place order.');
      }
    } catch (error) {
      setOrderStatus('Failed to place order.');
      console.error('Error placing order:', error);
    }
  };

  return (
      <div className="container mx-auto p-4 bg-gray-100 min-h-screen relative">
        <h1 className="text-3xl font-bold mt-3 mb-10 text-center text-gray-800">Spring Microservices Bookstore Demo</h1>

        <section className="mb-12 p-6 bg-white shadow-lg rounded-md">
          <h2 className="text-2xl font-semibold mb-5 text-gray-700">List of Books</h2>
          {booksLoading ? (
              <p>Loading...</p>
          ) : books.length > 0 ? (
              <ul className="list-disc pl-5 space-y-4">
                {books.map((book: Book) => (
                    <li key={book.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-800">{book.name}</span> - {book.description} - <span className="text-green-600">${book.price}</span>
                      </div>
                      <button onClick={() => handleDeleteBook(book.id)} className="text-red-500 hover:underline ml-4">Delete</button>
                    </li>
                ))}
              </ul>
          ) : (
              <p className="text-red-500">Failed to load books. Please try again.</p>
          )}
        </section>

        <section className="mb-12 p-6 bg-white shadow-lg rounded-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add a New Book</h2>
          <p className="mb-4 text-gray-600">Please enter the name, description, and price of the book you would like to add, and then press the Add Book button.</p>
          <div className="flex flex-col space-y-4">
            <input
                className="border border-gray-300 p-2 rounded-md"
                type="text"
                name="name"
                placeholder="Name"
                value={newBook.name}
                onChange={handleInputChange}
            />
            <input
                className="border border-gray-300 p-2 rounded-md"
                type="text"
                name="description"
                placeholder="Description"
                value={newBook.description}
                onChange={handleInputChange}
            />
            <input
                className="border border-gray-300 p-2 rounded-md"
                type="number"
                name="price"
                placeholder="Price"
                value={newBook.price}
                onChange={handleInputChange}
            />
            <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600" onClick={handleAddBook}>Add Book</button>
            {validationError && <p className="text-red-500 mt-2">{validationError}</p>}
          </div>
        </section>

        <section className="mb-12 p-6 bg-white shadow-lg rounded-md">
          <h2 className="text-2xl font-semibold mb-5 text-gray-700">List of Authors</h2>
          <ul className="list-disc pl-5 space-y-4">
            {authors.map((author) => (
                <li key={author.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-800">{author.name}</span> -
                    {new Date(author.birthDate).toLocaleDateString("en-US", {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                  <button onClick={() => deleteAuthor(author.id)} className="text-red-500 hover:underline ml-4">Delete
                  </button>
                </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 p-6 bg-white shadow-lg rounded-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add a New Author</h2>
          <p className="mb-4 text-gray-600">Enter the details for the new author and click &apos;Add Author&apos; to save.</p>
          <div className="flex flex-col space-y-4">
            <input
                className="border border-gray-300 p-2 rounded-md"
                type="text"
                name="name"
                placeholder="Name"
                value={newAuthor.name}
                onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
            />
            <input
                className="border border-gray-300 p-2 rounded-md"
                type="date"
                name="birthDate"
                placeholder="Birth Date"
                value={newAuthor.birthDate}
                onChange={(e) => setNewAuthor({...newAuthor, birthDate: e.target.value})}
            />
            <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600" onClick={addAuthor}>Add Author
            </button>
          </div>
        </section>

        <section ref={orderSectionRef} className="mb-12 p-6 bg-white shadow-lg rounded-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Place an Order</h2>
          <p className="mb-4 text-gray-600">Note that Design Patterns is in stock so the order will be placed successfully; however Mythical Man Month is not in stock.</p>
          <div className="flex items-center mb-4">
            <label className="mr-4 text-gray-700">Select a book to order:</label>
            <div className="flex space-x-4">
              {availableBooks.map(book => (
                  <button
                      key={book.skuCode}
                      className={`border p-2 rounded-md ${selectedBook.skuCode === book.skuCode ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                      onClick={() => setSelectedBook(book)}
                  >
                    {book.name} - ${book.price}
                  </button>
              ))}
            </div>
          </div>
          <button className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600" onClick={placeOrder}>Place Order</button>
          {orderStatus && <p className="mt-4 text-gray-800">{orderStatus}</p>}
        </section>

        <section className="mb-12 p-6 bg-white shadow-lg rounded-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Microservices Links</h2>
          <ul className="list-none space-y-4">
            <li>
              <h3 className="text-xl font-semibold text-gray-800">Eureka</h3>
              <p className="text-gray-600 mb-2">Eureka is a service registry for service discovery in cloud environments.</p>
              <a className="text-blue-500 hover:underline" href={urls.eureka} target="_blank" rel="noopener noreferrer">
                Go to Eureka - View registered services and instances
              </a>
            </li>
            <li>
              <h3 className="text-xl font-semibold text-gray-800">Zipkin</h3>
              <p className="text-gray-600 mb-2">Zipkin is a distributed tracing system for monitoring and troubleshooting microservices.</p>
              <a className="text-blue-500 hover:underline" href={urls.zipkin} target="_blank" rel="noopener noreferrer">
                Go to Zipkin - Visualize traces and track request flows
              </a>
            </li>
            <li>
              <h3 className="text-xl font-semibold text-gray-800">Prometheus</h3>
              <p className="text-gray-600 mb-2">Prometheus is a monitoring system and time series database.</p>
              <a className="text-blue-500 hover:underline" href={urls.prometheus} target="_blank" rel="noopener noreferrer">
                Go to Prometheus - Access metrics and set up alerts
              </a>
            </li>
            <li>
              <h3 className="text-xl font-semibold text-gray-800">Grafana</h3>
              <p className="text-gray-600 mb-2">Grafana is a visualization tool for monitoring and analyzing metrics.</p>
              <a className="text-blue-500 hover:underline" href={urls.grafana} target="_blank" rel="noopener noreferrer">
                Go to Grafana - Create and view dashboards
              </a>
            </li>
          </ul>
        </section>
      </div>
  );
}

export default Home;