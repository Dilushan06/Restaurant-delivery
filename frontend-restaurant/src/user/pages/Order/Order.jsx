/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import './Order.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


const Order = () => {

  const {getTotalCartAmount,token,food_list,cartItems,url} = useContext(StoreContext)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState(""); // 'pickup' or 'delivery'
  


  const [data,setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    houseNo:"",
    street:"",
    zipCode:"",
    phone:""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const order = async (event) => {
    event.preventDefault();
    let orderItems = [];
  
    Object.values(cartItems).forEach((cartItem) => {
      let foodItem = food_list.find((product) => product._id === cartItem.itemId);
      if (foodItem) {
        let extrasTotal = cartItem.extras.reduce(
          (acc, extra) => acc + (extra.price * extra.quantity), 0
        );
  
        orderItems.push({
          name: foodItem.name,
          price: foodItem.price,
          quantity: cartItem.quantity,
          extras: cartItem.extras || [],
          comment: cartItem.comment || ""
        });
      }
    });
  
    if (orderItems.length === 0) {
      alert("❌ No items in order. Please add items to your cart.");
      return;
    }
  
    const currentDate = new Date().toISOString();
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount(),
      date: currentDate,
      deliveryType: deliveryMethod,
    };
  
    try {
      let response;
      if (token) {
        // Logged in user
        orderData.userId = localStorage.getItem("userId");
        response = await axios.post(url + "/api/order/place", orderData, {
          headers: { token },
        });
      } else {
        // Guest user
        orderData.email = data.email;

        response = await axios.post(url + "/api/order/guest/checkout", orderData);
      }
  
      if (response.data.success) {

        localStorage.removeItem("guestCart");/////////////////////////////
        if (response.data.session_url) {
          // Go to Stripe payment
          window.location.replace(response.data.session_url);
        } else {
          // For guests - show message page
          //alert("✅ Order placed. Please check your email for the tracking link.");
          navigate("/");
        }
      } else {
        alert("❌ " + response.data.message);
      }
    } catch (error) {
      console.error("Order API Error:", error);
      alert("Failed to place order. Please check the console for details.");
    }
  };
  



  const navigate = useNavigate();

  useEffect(()=>{
    // if(getTotalCartAmount()===0){
    //   navigate('/cart')
    // }

    // If user is logged in, fetch last address
    const fetchLastAddress = async () => {
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        try {
          const res = await axios.get(`${url}/api/order/last/${userId}`, {
            headers: { token }
          });
          if (res.data.success && res.data.address) {
            setData(res.data.address);
          }
        } catch (error) {
          console.error("Could not fetch previous address:", error);
        }
      }
    };

    fetchLastAddress();
  },[])

  const handleDeliveryChoice = (method) => {
    setDeliveryMethod(method); 
    setShowDeliveryModal(false);
    
    setTimeout(() => {
      if (method === "pickup") {
        document.querySelector("form").requestSubmit();
      } else if (method === "delivery") {
        const allowedZipCodes = ['111', '222', '333']; // Update with your real ZIP codes
        if (allowedZipCodes.includes(data.zipCode)) {
          document.querySelector("form").requestSubmit();
        } else {
          alert("❌ Sorry, we don't deliver to your ZIP code. Please choose pickup.");
        }
      }
    }, 0); // wait for next event loop tick
  };
  
  
  
  

  return (

    <>
    {showDeliveryModal && (
      <div className="delivery-modal">
        <div className="delivery-modal-content">
          <h3>Choose Order Method</h3>
          <div className="options">
          <button onClick={() => handleDeliveryChoice("pickup")}>Pickup</button>
          <button onClick={() => handleDeliveryChoice("delivery")}>Delivery</button>
          </div>
          <button className="cancel" onClick={() => setShowDeliveryModal(false)}>Cancel</button>
        </div>
      </div>
    )}
    
    <form onSubmit={order} className='order'>
      <div className="order-left">
        <p className='title'>Order Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name'/>
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name'/>
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address'/>
        <div className="multi-fields">
          <input required name='houseNo' onChange={onChangeHandler} value={data.houseNo} type="text" placeholder='House number'/>
          <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street'/>
        </div>
        <input required name='zipCode' onChange={onChangeHandler} value={data.zipCode} type="text" placeholder='Zip code'/>
        <div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone'/>
        </div>
      </div>
      <div className='order-right'>
      <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <b>Total</b>
              <b>Kr {getTotalCartAmount()===0?0:getTotalCartAmount()}</b>
            </div>
          </div>
          <button type='button' onClick={() => setShowDeliveryModal(true)}>PICKUP / DELIVERY</button>
        </div>
      </div>
    </form>
    </>
  )
}

export default Order
