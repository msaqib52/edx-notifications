describe("NotificationPaneView", function(){

    beforeEach(function(){
        this.server = sinon.fakeServer.create();
        setFixtures(
            '<div>' +
            '<img class="edx-notifications-icon" src="/static/edx_notifications/img/notification_icon.jpg" />' +
            '<span class="edx-notifications-count-number"></span>' +
            '</div>' +
            '<div class="edx-notification-pane">' +
            '<script type="text/template" id="notification-pane-template">' +
            ' <div class="edx-notifications-container">' +
             '<div class="edx-notifications-content">' +
                '<h2>Notifications</h2>' +
                '<div class="actions">' +
                    '<ul class="notifications_list_tab">' +
                        '<li class="unread_notifications active"><a  href="#">View unread</a></li>' +
                        '<li class="user_notifications_all"><a href="#">View all</a></li>' +
                        '<li class="mark_notifications_read"><a href="#">Mark as read</a></li>' +
                    '</ul>' +
                '</div>' +
            '<ul>' +
                '<% if (typeof grouped_user_notifications == "undefined" || grouped_user_notifications.length == 0)' +
            '{ %>' +
                   ' <li>' +
                        '<p class="description">You have no unread notifications.</p>' +
                   ' </li>' +
                '<% } else { %>' +
                '<% _.each(grouped_user_notifications, function(grouped_user_notification){ %>' +
                    '<h3 class="borderB padB5 uppercase bold marB10">' +
                    '<%= grouped_user_notification.group_title %></h3>' +
                    '<h3 class="marT0"><a href="">Welcome to <%= global_variables.app_name %></a></h3>' +
                    '<% _.each(grouped_user_notification.messages, function(message){ %>' +
                        '<li class="marB10 padB5 borderB">' +
                            '<div class="date">' +
                                '<%= new Date(message.msg.created).toString("MMMM dd, yyyy") %>' +
                            '</div>' +
                            '<p class="description">' +
                               '<span data-msg-id="<%= message.msg.id %>" ' +
                                'data-click-link="<%=message.msg.payload["_click_link"]%>">' +
							   '<%= message.html %></span>' +
                            '</p>' +
                        '</li>' +
                    '<% }); %>' +
                '<% }); %>' +
                '<% } %>' +
            '</ul>' +
        '</div>' +
    '</div>' +
'</script>' +
            '</div>'
        );
        this.notification_pane = new NotificationPaneView({
            el: $(".edx-notifications-icon"),
            count_el: $(".edx-notifications-count-number"),
            pane_el: $(".edx-notification-pane"),
            endpoints: {
                unread_notification_count: "/unread/count/?read=False&unread=True",
                mark_all_user_notifications_read: "/mark/as/read",
                user_notifications_all:"/all/notifications/?read=True&unread=True",
                user_notifications_unread_only: "unread/notifications/?read=False&unread=True",
                renderer_templates_urls: "/renderer/templates",
                user_notification_mark_read: "read/notifications"
            },
            global_variables: {
                app_name: "none"
            }
        });
        this.notification_pane.render();
        this.all_notifications_target = $(".user_notifications_all");
        this.unread_notifications_target = $(".unread_notifications");
        this.mark_notifications_read_target = $(".mark_notifications_read");
        this.notification_content_target = $(".edx-notifications-content>ul>li");
        this.prevent_click_target = $(".edx-notifications-content");
    });

    afterEach(function() {
        this.server.restore();
    });

    it("checks if template function is defined", function(){
        expect(this.notification_pane.template).toBeDefined()
    });

    it("successfully sets given urls in endpoint", function(){
        expect(this.notification_pane.mark_all_read_endpoint).toEqual('/mark/as/read');
        expect(this.notification_pane.all_msgs_endpoint).toBe('/all/notifications/?read=True&unread=True');
        expect(this.notification_pane.unread_msgs_endpoint).toBe('unread/notifications/?read=False&unread=True');
        expect(this.notification_pane.renderer_templates_url_endpoint).toEqual('/renderer/templates');
    });

    it("initializes collection_url with unread notification endpoints as default value", function(){
        expect(this.notification_pane.collection.url).toEqual('unread/notifications/?read=False&unread=True');
    });

    it("initializes selected pane with unread notification as default value", function(){
        expect(this.notification_pane.selected_pane).toEqual('unread');
    });

    it("intilizes .edx-notifications-content htm", function(){
        expect(this.notification_content_target.html()).toContain('You have no unread notifications')
    });

    it("calls allUserNotificationsClicked function on clicking .user_notifications_all", function(){
        spyOn(this.notification_pane, 'allUserNotificationsClicked');
        this.notification_pane.delegateEvents();
        this.all_notifications_target.click();
        expect(this.notification_pane.allUserNotificationsClicked).toHaveBeenCalled();
    });

    it("sets collection url new value after calling allUserNotificationsClicked function", function(){
        this.all_notifications_target.click();
        expect(this.notification_pane.collection.url).toContain('/all/notifications');
    });

    it("sets selected pane new value after calling allUserNotificationsClicked function", function(){
        this.all_notifications_target.click();
        expect(this.notification_pane.selected_pane).toContain('all')
    });

    it("calls unreadNotificationsClicked function on clicking .unread_notifications", function(){
        var unreadNotificationsSpy = spyOn(this.notification_pane, 'unreadNotificationsClicked');
        this.notification_pane.delegateEvents();
        this.unread_notifications_target.click();
        expect(unreadNotificationsSpy).toHaveBeenCalled();
    });

    it("sets collection url new value after calling unreadNotificationsClicked function", function(){
        this.unread_notifications_target.click();
        expect(this.notification_pane.collection.url).toContain('unread/notifications/?read=False&unread=True');
    });

    it("sets selected pane new value after calling unreadNotificationsClicked function", function(){
        this.unread_notifications_target.click();
        expect(this.notification_pane.selected_pane).toContain('unread');
    });

    it("calls markNotificationsRead function on clicking .mark_notifications_read", function(){
        spyOn(this.notification_pane, 'markNotificationsRead');
        this.notification_pane.delegateEvents();
        this.mark_notifications_read_target.click();
        expect(this.notification_pane.markNotificationsRead).toHaveBeenCalled();
    });

    it("sets collection url new value after calling markNotificationsRead function", function(){
        this.mark_notifications_read_target.click();
        expect(this.notification_pane.collection.url).toContain('/mark/as/read');
    });

    it("sets selected pane new value after calling markNotificationsRead function", function(){
        this.mark_notifications_read_target.click();
        expect(this.notification_pane.selected_pane).toContain('unread');
    });

    it("calls visitNotification function on clicking .edx-notifications-content>ul>li", function(){
        var visitNotificationSpy = spyOn(this.notification_pane, 'visitNotification');
        this.notification_pane.delegateEvents();
        this.notification_content_target.click();
        expect(visitNotificationSpy).toHaveBeenCalled();
    });

    it("sets collection url new value after calling visitNotification function", function(){
        this.notification_content_target.click();
        expect(this.notification_pane.collection.url).toContain('read/notificationsundefined');
    });

    it("sets notification_content_target.html calling visitNotification function", function(){
        this.notification_content_target.click();
        expect(this.notification_content_target.html()).toContain('You have no unread notifications')
    });

    it("calls preventHidingWhenClickedInside function on clicking .edx-notifications-content", function(){
        var preventHidingWhenClickedInsideSpy = spyOn(this.notification_pane, 'preventHidingWhenClickedInside');
        this.notification_pane.delegateEvents();
        this.prevent_click_target.click();
        expect(preventHidingWhenClickedInsideSpy).toHaveBeenCalled();
    });

});
