import { DataTypes } from "sequelize";
import {sequelize} from "../../config/db.js";


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
        allowNull:false
    },

    password:{
        type:DataTypes.STRING,
        allowNull:false
    },

    role:{
        type:DataTypes.STRING,
        defaultValue:"TEAM_MEMBER"
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