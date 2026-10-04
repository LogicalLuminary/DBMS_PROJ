package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Teacher")
public class Teacher {

    @Id
    @Column(name = "Teacher_id")
    private Integer Teacher_id;

    @Column(name = "First_name")
    private String First_name;

    @Column(name = "Last_name")
    private String Last_name;

    @Column(name = "DOB")
    private LocalDate DOB;

    @Column(name = "Sex")
    private String Sex;

    @Column(name = "Email")
    private String Email;

    @Column(name = "Credential")
    private String Credential;

    @Column(name = "Salary")
    private BigDecimal Salary;

    @Column(name = "Joining_date")
    private LocalDate Joining_date;

    @Column(name = "House_no")
    private String House_no;

    @Column(name = "Street")
    private String Street;

    @Column(name = "Pincode")
    private String Pincode;

    @Column(name = "Aadhar_id")
    private String Aadhar_id;

    // Changed to all lowercase to prevent Hibernate from inserting an underscore between last and seen
    @Column(name = "lastseen_global_notification_id")
    private Integer LastSeen_Global_Notification_id;

    public Teacher() {}

    public Integer getTeacher_id() {
        return Teacher_id;
    }

    public void setTeacher_id(Integer Teacher_id) {
        this.Teacher_id = Teacher_id;
    }

    public String getFirst_name() {
        return First_name;
    }

    public void setFirst_name(String First_name) {
        this.First_name = First_name;
    }

    public String getLast_name() {
        return Last_name;
    }

    public void setLast_name(String Last_name) {
        this.Last_name = Last_name;
    }

    public LocalDate getDOB() {
        return DOB;
    }

    public void setDOB(LocalDate DOB) {
        this.DOB = DOB;
    }

    public String getSex() {
        return Sex;
    }

    public void setSex(String Sex) {
        this.Sex = Sex;
    }

    public String getEmail() {
        return Email;
    }

    public void setEmail(String Email) {
        this.Email = Email;
    }

    public String getCredential() {
        return Credential;
    }

    public void setCredential(String Credential) {
        this.Credential = Credential;
    }

    public BigDecimal getSalary() {
        return Salary;
    }

    public void setSalary(BigDecimal Salary) {
        this.Salary = Salary;
    }

    public LocalDate getJoining_date() {
        return Joining_date;
    }

    public void setJoining_date(LocalDate Joining_date) {
        this.Joining_date = Joining_date;
    }

    public String getHouse_no() {
        return House_no;
    }

    public void setHouse_no(String House_no) {
        this.House_no = House_no;
    }

    public String getStreet() {
        return Street;
    }

    public void setStreet(String Street) {
        this.Street = Street;
    }

    public String getPincode() {
        return Pincode;
    }

    public void setPincode(String Pincode) {
        this.Pincode = Pincode;
    }

    public String getAadhar_id() {
        return Aadhar_id;
    }

    public void setAadhar_id(String Aadhar_id) {
        this.Aadhar_id = Aadhar_id;
    }

    public Integer getLastSeen_Global_Notification_id() {
        return LastSeen_Global_Notification_id;
    }

    public void setLastSeen_Global_Notification_id(Integer LastSeen_Global_Notification_id) {
        this.LastSeen_Global_Notification_id = LastSeen_Global_Notification_id;
    }

}