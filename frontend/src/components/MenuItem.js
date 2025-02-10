function MenuItem({ item, addToCart }) {
    return (
      <div className="border p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p>₹{item.price}</p>
        <button 
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg" 
          onClick={() => addToCart(item)}
        >
          Add to Cart
        </button>
      </div>
    );
  }
  
  export default MenuItem;
  