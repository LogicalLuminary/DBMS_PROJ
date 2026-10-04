package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "globalnotification")
public class Globalnotification {

    @Id
    @Column(name = "Notification_id")
    private Integer Notification_id;

    @Column(name = "Assistant_id")
    private Integer Assistant_id;

    @Column(name = "Notification_date")
    private LocalDate Notification_date;

    @Column(name = "Notification_time")
    private LocalTime Notification_time;

    @Column(name = "Notification_title")
    private String Notification_title;

    @Column(name = "Description")
    private String Description;

    public Globalnotification() {}

    public Integer getNotification_id() {
        return Notification_id;
    }

    public void setNotification_id(Integer Notification_id) {
        this.Notification_id = Notification_id;
    }

    public Integer getAssistant_id() {
        return Assistant_id;
    }

    public void setAssistant_id(Integer Assistant_id) {
        this.Assistant_id = Assistant_id;
    }

    public LocalDate getNotification_date() {
        return Notification_date;
    }

    public void setNotification_date(LocalDate Notification_date) {
        this.Notification_date = Notification_date;
    }

    public LocalTime getNotification_time() {
        return Notification_time;
    }

    public void setNotification_time(LocalTime Notification_time) {
        this.Notification_time = Notification_time;
    }

    public String getNotification_title() {
        return Notification_title;
    }

    public void setNotification_title(String Notification_title) {
        this.Notification_title = Notification_title;
    }

    public String getDescription() {
        return Description;
    }

    public void setDescription(String Description) {
        this.Description = Description;
    }

}