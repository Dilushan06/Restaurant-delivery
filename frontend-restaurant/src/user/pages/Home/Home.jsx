/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import Menu from "../../components/Menu/Menu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";

const Home = () => {
  
  const [category,setCategory] = useState("All")

  return (
    <div>
      <Header />
    </div>
  );
};

export default Home;
