from flask_mail import Mail
from flask_mail import Message
import os

mail = Mail()

def get_order_message_id(order_id):
    """Generera ett konsekvent Message-ID för en order"""
    domain = os.getenv('MAIL_USERNAME', 'gardsbutiken@gmail.com').split('@')[-1]
    return f"<order-{order_id}@{domain}>"

def send_order_confirmation(recipient_email, order):
    print(f"DEBUG: Startar mejlprocess för order {order.order_id}", flush=True)
    try:
        item_rows = ""
        total_price = 0
        
        for item in order.items:
        
            qty = item.quantity or 0
            price_per_unit = float(item.list_price) if item.list_price else 0
            line_total = price_per_unit * qty
            total_price += line_total
            
            p_name = item.product.product_name if item.product else "Okänd produkt"
            
            item_rows += f"""
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{p_name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{qty} st</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{line_total:.2f} kr</td>
                </tr>
            """

        # Generera ett konsekvent Message-ID så uppföljningsmail kan referera till det
        message_id = get_order_message_id(order.order_id)
        
        msg = Message(
            subject=f"Tack för din beställning #{order.order_id}!",
            recipients=[recipient_email],
            extra_headers={'Message-ID': message_id}
        )
        
        msg.html = f"""
            <div style="font-family: sans-serif; max-width: 600px;">
                <h1 style="color: #4A773C;">Tack för din beställning!</h1>
                <p>Här är en sammanställning av dina varor:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f8f8f8;">
                            <th style="text-align: left; padding: 8px;">Vara</th>
                            <th style="text-align: left; padding: 8px;">Antal</th>
                            <th style="text-align: left; padding: 8px;">Pris</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item_rows}
                    </tbody>
                </table>
                <p style="font-size: 1.2em;"><strong>Totalt att betala på plats: {total_price:.2f} kr</strong></p>
                <p><strong>Upphämtning:</strong> {order.Pickup_date}</p>
                <hr>
                <p style="color: #666; font-size: 0.8em;">Detta är en automatisk bekräftelse från Gårdsbutiken.</p>
            </div>
        """
        
        mail.send(msg)
        print(f"DEBUG: Bekräftelse skickad till {recipient_email}", flush=True)
        return True

    except Exception as e:
        print(f"ERROR i send_order_confirmation: {str(e)}", flush=True)
        return False

def send_ready_for_pickup_email(recipient_email, order):
    """Skicka mail när ordern är redo för upphämtning"""
    print(f"DEBUG: Skickar redo-för-upphämtning mail för order {order.order_id}", flush=True)
    try:
        item_rows = ""
        total_price = 0
        
        for item in order.items:
            qty = item.quantity or 0
            price_per_unit = float(item.list_price) if item.list_price else 0
            line_total = price_per_unit * qty
            total_price += line_total
            
            p_name = item.product.product_name if item.product else "Okänd produkt"
            
            item_rows += f"""
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{p_name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{qty} st</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{line_total:.2f} kr</td>
                </tr>
            """

        # Referera till ursprungliga bekräftelsemailet för att skapa en tråd
        original_message_id = get_order_message_id(order.order_id)
        
        msg = Message(
            subject=f"Re: Tack för din beställning #{order.order_id}!",
            recipients=[recipient_email],
            extra_headers={
                'In-Reply-To': original_message_id,
                'References': original_message_id
            }
        )
        
        pickup_date = order.Pickup_date if order.Pickup_date else "Kontakta oss för mer info"
        
        msg.html = f"""
            <div style="font-family: sans-serif; max-width: 600px;">
                <h1 style="color: #4A773C;">Din beställning är redo!</h1>
                <p style="font-size: 1.1em;">Hej! Vi vill meddela att din beställning <strong>#{order.order_id}</strong> nu är redo för upphämtning.</p>
                
                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2e7d32;">Upphämtningsdatum: {pickup_date}</h3>
                    <p style="margin-bottom: 0;">Välkommen till gårdsbutiken för att hämta dina varor!</p>
                </div>
                
                <h3>Din beställning:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f8f8f8;">
                            <th style="text-align: left; padding: 8px;">Vara</th>
                            <th style="text-align: left; padding: 8px;">Antal</th>
                            <th style="text-align: left; padding: 8px;">Pris</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item_rows}
                    </tbody>
                </table>
                <p style="font-size: 1.2em;"><strong>Totalt att betala: {total_price:.2f} kr</strong></p>
                <hr>
                <p style="color: #666; font-size: 0.8em;">Detta är ett automatiskt meddelande från Gårdsbutiken.</p>
            </div>
        """
        
        mail.send(msg)
        print(f"DEBUG: Redo-för-upphämtning mail skickat till {recipient_email}", flush=True)
        return True

    except Exception as e:
        print(f"ERROR i send_ready_for_pickup_email: {str(e)}", flush=True)
        return False