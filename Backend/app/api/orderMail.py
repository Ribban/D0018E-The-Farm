from flask_mail import Mail
from flask_mail import Message

mail = Mail()

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

        msg = Message(
            subject=f"Tack för din beställning #{order.order_id}!",
            recipients=[recipient_email]
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