import { DataTypes } from "sequelize";
import {sequelize} from "../../config/db";


const User = sequelize.define("User", {

    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    name:{
        type:DataTypes.STRING,
        allowNull:false
    },

    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },

    password:{
        type:DataTypes.STRING,
        allowNull:false
    },

    role:{
        type:DataTypes.STRING,
        defaultValue:"Team Member"
    },

    department:{
        type:DataTypes.STRING
    },

    status:{
        type:DataTypes.STRING,
        defaultValue:"Active"
    },

    avatar:{
        type:DataTypes.STRING
    }

});


export default User;